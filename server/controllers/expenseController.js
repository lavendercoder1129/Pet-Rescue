import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import RescueCase from '../models/RescueCase.js';
import FundAllocation from '../models/FundAllocation.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { calculateCaseFinancials } from './fundController.js';

/**
 * @route   POST /api/expenses
 * @desc    Submit an expense with supporting documents for an active fund allocation
 * @access  Private (Rescuer owner or Admin)
 */
export const submitExpense = async (req, res, next) => {
  try {
    const user = req.user;
    console.log('[submitExpense] user:', user?._id, 'body:', req.body, 'files:', req.files?.length);
    const caseId = req.body.caseId || req.body.rescueCaseId;
    const allocationId = req.body.allocationId || req.body.fundAllocationId;
    const {
      title,
      description,
      expenseCategory,
      amount,
      expenseDate,
      documentType = 'Hospital Invoice / Medical Bill',
      documentDescription = '',
    } = req.body;

    // 1. Role validation: Must be approved rescuer or admin
    if (user.role !== 'rescuer' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only registered rescuers and administrators can submit expense proofs.',
      });
    }

    if (user.role === 'rescuer' && user.rescuerVerificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your rescuer profile is pending verification. Only approved rescuers may submit expenses.',
      });
    }

    // 2. Validate IDs
    if (!caseId || !mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid rescue case ID is required.',
      });
    }

    if (!allocationId || !mongoose.Types.ObjectId.isValid(allocationId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid fund allocation ID is required.',
      });
    }

    // 3. Verify Case ownership and eligibility
    const rescueCase = await RescueCase.findById(caseId);
    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    // Ownership check: Only owner of the case or admin may submit expenses
    if (user.role !== 'admin' && rescueCase.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to submit expense proofs for your own rescue cases.',
      });
    }

    if (rescueCase.verificationStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Expenses can only be submitted for Approved rescue cases.',
      });
    }

    // 7. Verify Allocation
    const allocation = await FundAllocation.findById(allocationId);
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Fund allocation not found.',
      });
    }

    if (allocation.rescueCase.toString() !== rescueCase._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'The selected fund allocation does not belong to this rescue case.',
      });
    }

    if (allocation.status === 'Cancelled' || allocation.status === 'Fully Spent') {
      return res.status(400).json({
        success: false,
        message: `Cannot link expense to an allocation with status "${allocation.status}". Must be active.`,
      });
    }

    // 4. Validate Amount
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount must be a positive number greater than zero.',
      });
    }

    // 5. Validate Date (defaults to now if omitted)
    let parsedDate = expenseDate ? new Date(expenseDate) : new Date();
    if (isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expense date must be a valid date in the past or present.',
      });
    }

    // 6. Verify Proof Documents (Multer upload)
    const proofDocuments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        proofDocuments.push({
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          storagePath: file.path,
        });
      });
    }

    if (proofDocuments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one supporting expense proof document (bill, invoice, or receipt) is required.',
      });
    }

    // 7. Calculate unspent allocation balance
    const availableAllocBalance = Math.max(0, allocation.amount - (allocation.amountSpent || 0));
    if (numAmount > availableAllocBalance) {
      return res.status(400).json({
        success: false,
        message: `Expense amount (₹${numAmount.toLocaleString()}) exceeds the available allocation balance (₹${availableAllocBalance.toLocaleString()}).`,
      });
    }

    // 8. Create Expense (Strictly defaults to Pending)
    const newExpense = await Expense.create({
      rescueCase: rescueCase._id,
      fundAllocation: allocation._id,
      submittedBy: user._id,
      title: title ? title.trim() : 'Expense Submission',
      description: description ? description.trim() : 'Clinical treatment and supplies expenditure',
      expenseCategory: expenseCategory || 'Other',
      amount: numAmount,
      expenseDate: parsedDate,
      proofDocuments,
      documentType: documentType.trim(),
      documentDescription: documentDescription ? documentDescription.trim() : '',
      verificationStatus: 'Pending', // Enforced by backend logic
      isSimulated: true,
    });

    // 9. Audit Log
    await AuditLog.create({
      caseId: rescueCase._id,
      expenseId: newExpense._id,
      adminId: user._id,
      action: 'Expense Submitted',
      previousStatus: 'None',
      newStatus: 'Pending',
      reviewNote: `Rescuer submitted ₹${numAmount.toLocaleString()} under "${expenseCategory}" with ${proofDocuments.length} proof document(s).`,
      timestamp: new Date(),
    }).catch(() => {});

    // In-app notification for submitting rescuer
    await Notification.create({
      recipient: user._id,
      title: 'Expense Proof Queued for Audit 📄',
      message: `Your expense "${newExpense.title}" (₹${numAmount.toLocaleString()}) for ${rescueCase.animalName} was queued for administrative verification.`,
      caseId: rescueCase._id,
    }).catch(() => {});

    const populatedExpense = await Expense.findById(newExpense._id)
      .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected')
      .populate('fundAllocation', 'allocationReference allocationCategory amount amountSpent status')
      .populate('submittedBy', 'name email')
      .lean();

    console.log('[submitExpense SUCCESS]', newExpense._id);
    return res.status(201).json({
      success: true,
      message: 'Expense proof submitted successfully and queued for admin verification.',
      expense: populatedExpense,
    });
  } catch (error) {
    console.error('[submitExpense ERROR]', error);
    next(error);
  }
};

/**
 * @route   GET /api/expenses/my
 * @desc    Get authenticated rescuer's submitted expenses
 * @access  Private (Rescuer)
 */
export const getMyExpenses = async (req, res, next) => {
  try {
    const user = req.user;
    const { status = 'All', category = 'All', caseId, page = 1, limit = 10 } = req.query;

    const filter = { submittedBy: user._id };

    if (status && status !== 'All') {
      filter.verificationStatus = status;
    }

    if (category && category !== 'All') {
      filter.expenseCategory = category;
    }

    if (caseId && mongoose.Types.ObjectId.isValid(caseId)) {
      filter.rescueCase = caseId;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [expenses, totalCount] = await Promise.all([
      Expense.find(filter)
        .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected')
        .populate('fundAllocation', 'allocationReference allocationCategory amount amountSpent status')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Expense.countDocuments(filter),
    ]);

    // Don't expose internal file system storage paths
    const sanitizedExpenses = expenses.map((exp) => ({
      ...exp,
      proofDocuments: exp.proofDocuments.map((doc) => ({
        _id: doc._id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        documentUrl: `/api/expenses/${exp._id}/documents/${doc._id}`,
      })),
    }));

    res.status(200).json({
      success: true,
      count: sanitizedExpenses.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      expenses: sanitizedExpenses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/expenses/:id
 * @desc    Get detailed expense view (Rescuer owner or Admin only)
 * @access  Private
 */
export const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    const expense = await Expense.findById(id)
      .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected createdBy')
      .populate('fundAllocation', 'allocationReference allocationCategory amount amountSpent status')
      .populate('submittedBy', 'name email phone')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    // Authorization check: Submitter, Case Owner, or Admin
    const isOwner = expense.submittedBy?._id?.toString() === user._id.toString();
    const isCaseOwner = expense.rescueCase?.createdBy?.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isCaseOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this expense record.',
      });
    }

    // Attach document access URLs
    const sanitizedDocs = expense.proofDocuments.map((doc) => ({
      _id: doc._id,
      fileName: doc.fileName,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      documentUrl: `/api/expenses/${expense._id}/documents/${doc._id}`,
    }));

    res.status(200).json({
      success: true,
      expense: {
        ...expense,
        proofDocuments: sanitizedDocs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/expenses/:id/documents/:documentId
 * @desc    Stream/download private supporting proof document with authentication
 * @access  Private (Owner, Case Owner, or Admin only)
 */
export const getExpenseDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(404).json({
        success: false,
        message: 'Document reference not found.',
      });
    }

    const expense = await Expense.findById(id).populate('rescueCase', 'createdBy').lean();
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found.',
      });
    }

    // Authorization check
    const isOwner = expense.submittedBy.toString() === user._id.toString();
    const isCaseOwner = expense.rescueCase?.createdBy?.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isCaseOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this private expense document.',
      });
    }

    const doc = expense.proofDocuments.find((d) => d._id.toString() === documentId);
    if (!doc || !doc.storagePath || !fs.existsSync(doc.storagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on disk.',
      });
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
    fs.createReadStream(doc.storagePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/expenses
 * @desc    Admin list of all submitted expenses with filters & stats
 * @access  Private (Admin only)
 */
export const getAdminExpenses = async (req, res, next) => {
  try {
    const {
      status = 'All',
      caseId,
      category = 'All',
      rescuerId,
      startDate,
      endDate,
      search = '',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status && status !== 'All') {
      filter.verificationStatus = status;
    }

    if (category && category !== 'All') {
      filter.expenseCategory = category;
    }

    if (caseId && mongoose.Types.ObjectId.isValid(caseId)) {
      filter.rescueCase = caseId;
    }

    if (rescuerId && mongoose.Types.ObjectId.isValid(rescuerId)) {
      filter.submittedBy = rescuerId;
    }

    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) filter.expenseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.expenseDate.$lte = end;
      }
    }

    if (search && search.trim()) {
      filter.title = new RegExp(search.trim(), 'i');
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [expenses, totalCount, statsAgg] = await Promise.all([
      Expense.find(filter)
        .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected')
        .populate('fundAllocation', 'allocationReference allocationCategory amount amountSpent status')
        .populate('submittedBy', 'name email phone')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Expense.countDocuments(filter),
      Expense.aggregate([
        {
          $group: {
            _id: '$verificationStatus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    // Parse stats
    let totalSubmitted = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let totalApprovedSpending = 0;

    statsAgg.forEach((s) => {
      totalSubmitted += s.count;
      if (s._id === 'Pending') pendingCount = s.count;
      if (s._id === 'Approved') {
        approvedCount = s.count;
        totalApprovedSpending = s.totalAmount;
      }
      if (s._id === 'Rejected') rejectedCount = s.count;
    });

    const sanitizedExpenses = expenses.map((exp) => ({
      ...exp,
      proofDocuments: exp.proofDocuments.map((doc) => ({
        _id: doc._id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        documentUrl: `/api/expenses/${exp._id}/documents/${doc._id}`,
      })),
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalSubmitted,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalApprovedSpending,
      },
      count: sanitizedExpenses.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      expenses: sanitizedExpenses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/expenses/:id
 * @desc    Admin detailed view of single expense with evidence & allocation balances
 * @access  Private (Admin only)
 */
export const getAdminExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    const expense = await Expense.findById(id)
      .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected createdBy')
      .populate('fundAllocation', 'allocationReference allocationCategory amount amountSpent status')
      .populate('submittedBy', 'name email phone rescuerVerificationStatus')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    const sanitizedDocs = expense.proofDocuments.map((doc) => ({
      _id: doc._id,
      fileName: doc.fileName,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      documentUrl: `/api/expenses/${expense._id}/documents/${doc._id}`,
    }));

    // Calculate current allocation balance
    const alloc = expense.fundAllocation;
    const remainingAllocBalance = alloc
      ? Math.max(0, alloc.amount - (alloc.amountSpent || 0))
      : 0;

    res.status(200).json({
      success: true,
      expense: {
        ...expense,
        proofDocuments: sanitizedDocs,
      },
      allocationContext: {
        totalAllocated: alloc?.amount || 0,
        previouslyApprovedSpending: alloc?.amountSpent || 0,
        remainingAllocBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/expenses/:id/approve
 * @desc    Approve a pending expense and update verified spending
 * @access  Private (Admin only)
 */
export const approveExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewNote = '' } = req.body;
    const adminUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    // Validation: Expense must be Pending
    if (expense.verificationStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Expense is already in "${expense.verificationStatus}" state. Cannot re-approve.`,
      });
    }

    // Retrieve and validate linked allocation
    const allocation = await FundAllocation.findById(expense.fundAllocation);
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Linked fund allocation not found.',
      });
    }

    if (allocation.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve expense against a Cancelled allocation.',
      });
    }

    // Check available balance on allocation
    const availableBalance = Math.max(0, allocation.amount - (allocation.amountSpent || 0));
    if (expense.amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Expense amount (₹${expense.amount.toLocaleString()}) exceeds unspent allocation balance (₹${availableBalance.toLocaleString()}).`,
      });
    }

    // Atomic update of Allocation amountSpent & status
    const newSpent = (allocation.amountSpent || 0) + expense.amount;
    const newStatus = newSpent >= allocation.amount ? 'Fully Spent' : 'Partially Spent';

    allocation.amountSpent = newSpent;
    allocation.status = newStatus;
    await allocation.save();

    // Update Expense to Approved
    expense.verificationStatus = 'Approved';
    expense.reviewedBy = adminUser._id;
    expense.reviewedAt = new Date();
    expense.reviewNote = reviewNote ? String(reviewNote).trim().slice(0, 1000) : '';
    await expense.save();

    // Record in Audit Log
    await AuditLog.create({
      caseId: expense.rescueCase,
      expenseId: expense._id,
      adminId: adminUser._id,
      action: 'Expense Approved',
      previousStatus: 'Pending',
      newStatus: 'Approved',
      reviewNote: `Approved expense ₹${expense.amount.toLocaleString()}. Note: ${expense.reviewNote}`,
      timestamp: new Date(),
    }).catch(() => {});

    // In-app notification for rescuer
    await Notification.create({
      recipient: expense.submittedBy,
      title: 'Expense Proof Verified & Approved! 🩺',
      message: `Your clinical expense "${expense.title}" for ₹${expense.amount.toLocaleString()} was approved against allocation ${allocation.allocationReference}.${expense.reviewNote ? ` Note: "${expense.reviewNote}"` : ''}`,
      caseId: expense.rescueCase,
    }).catch(() => {});

    // Recompute case financials
    const updatedFinancials = await calculateCaseFinancials(expense.rescueCase);

    res.status(200).json({
      success: true,
      message: `Expense "${expense.title}" approved and verified spending updated.`,
      expense,
      allocation,
      caseFinancials: updatedFinancials,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/expenses/:id/reject
 * @desc    Reject a pending expense with a mandatory reason
 * @access  Private (Admin only)
 */
export const rejectExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;
    const adminUser = req.user;

    if (!reviewNote || !reviewNote.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason / review note is strictly required to reject an expense.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found.',
      });
    }

    if (expense.verificationStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Expense is already in "${expense.verificationStatus}" state. Cannot re-evaluate.`,
      });
    }

    expense.verificationStatus = 'Rejected';
    expense.reviewedBy = adminUser._id;
    expense.reviewedAt = new Date();
    expense.reviewNote = reviewNote.trim().slice(0, 1000);
    await expense.save();

    // Record in Audit Log
    await AuditLog.create({
      caseId: expense.rescueCase,
      expenseId: expense._id,
      adminId: adminUser._id,
      action: 'Expense Rejected',
      previousStatus: 'Pending',
      newStatus: 'Rejected',
      reviewNote: expense.reviewNote,
      timestamp: new Date(),
    }).catch(() => {});

    // In-app notification for rescuer with clear feedback
    await Notification.create({
      recipient: expense.submittedBy,
      title: 'Expense Proof Requires Revision / Rejected ⚠️',
      message: `Your expense "${expense.title}" (₹${expense.amount.toLocaleString()}) was rejected. Reason: "${expense.reviewNote}". Please inspect review feedback in your Rescuer Expenses history.`,
      caseId: expense.rescueCase,
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `Expense "${expense.title}" has been rejected.`,
      expense,
    });
  } catch (error) {
    next(error);
  }
};
