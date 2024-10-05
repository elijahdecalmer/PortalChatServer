import { Schema, model } from 'mongoose';

// A user can have a profile picture, a bio and a role. I have chosen to do simplified token authentication to demonstrate session-like use without the complexity of sessions
const ReportSchema = new Schema({
    message: { type: String, required: true },
    reporter: { type: String, required: true },
});

const Report = model('Report', ReportSchema);
export { Report }
