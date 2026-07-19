import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const ROLES = ["Super Admin", "HR Manager", "Employee"];
const STATUSES = ["Active", "Inactive"];

const employeeSchema = new Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9+\-\s()]{7,15}$/, "Please provide a valid phone number"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary must be a positive number"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "Active",
    },
    role: {
      type: String,
      enum: ROLES,
      default: "Employee",
    },
    reportingManager: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    profileImage: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

employeeSchema.index({ name: "text", email: "text" });

// Hash password before save
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Exclude soft-deleted docs by default on find queries
function excludeDeleted() {
  this.where({ isDeleted: { $ne: true } });
}
employeeSchema.pre(/^find/, function (next) {
  if (this.getFilter().includeDeleted) {
    delete this.getFilter().includeDeleted;
    return next();
  }
  excludeDeleted.call(this);
  next();
});

employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

employeeSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.isDeleted;
  delete obj.deletedAt;
  return obj;
};

export const ROLE_VALUES = ROLES;
export const STATUS_VALUES = STATUSES;

export default mongoose.model("Employee", employeeSchema);
