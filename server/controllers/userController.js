import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Superadmin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Superadmin
export const updateUserRole = async (req, res, next) => {
  const { role } = req.body;
  const { id } = req.params;

  try {
    if (!['superadmin', 'pharmacist', 'customer'].includes(role)) {
      res.status(400);
      throw new Error('Invalid role specified');
    }

    // Protect last superadmin from role change (optional safety check)
    const userToChange = await User.findById(id);
    if (!userToChange) {
      res.status(404);
      throw new Error('User not found');
    }

    if (userToChange.role === 'superadmin' && role !== 'superadmin') {
      const superadminCount = await User.countDocuments({ role: 'superadmin' });
      if (superadminCount <= 1) {
        res.status(400);
        throw new Error('Cannot change the role of the only remaining superadmin');
      }
    }

    userToChange.role = role;
    await userToChange.save();

    res.json({
      _id: userToChange._id,
      name: userToChange.name,
      email: userToChange.email,
      role: userToChange.role,
      message: `User role updated to ${role} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Superadmin
export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Safety: prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own account');
    }

    // Prevent deleting the last superadmin
    if (user.role === 'superadmin') {
      const superadminCount = await User.countDocuments({ role: 'superadmin' });
      if (superadminCount <= 1) {
        res.status(400);
        throw new Error('Cannot delete the only remaining superadmin');
      }
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers
// @route   GET /api/users/customers
// @access  Private/Pharmacist/Superadmin
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile name or phone
// @route   PATCH /api/users/profile
// @access  Private
export const updateProfileNameOrPhone = async (req, res, next) => {
  const { name, phone, currentPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (phone !== undefined) {
      const normalizedNewPhone = phone.trim();
      const normalizedOldPhone = (user.phone || '').trim();

      if (normalizedNewPhone !== normalizedOldPhone) {
        if (!currentPassword) {
          res.status(400);
          throw new Error('Password is required to confirm change');
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          res.status(401);
          throw new Error('Incorrect password');
        }

        user.phone = normalizedNewPhone;
      }
    }

    if (name !== undefined && name.trim()) {
      user.name = name;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    next(error);
  }
};
