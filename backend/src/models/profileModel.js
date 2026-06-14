import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  techStack:   [String],
  link:        { type: String, default: '' },
});

const profileSchema = new mongoose.Schema(
  {
    singleton:  { type: Boolean, default: true, unique: true }, // only ONE profile ever
    name:       { type: String, required: [true, 'Name is required'] },
    bio:        { type: String, default: '' },   // 2-3 lines used in every AI prompt
    resumeText: { type: String, default: '' },   // full resume as plain text
    skills:     [String],
    projects:   [projectSchema],
    resumeLink: { type: String, default: '' },   // Google Drive URL
  },
  { timestamps: true }
);

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;