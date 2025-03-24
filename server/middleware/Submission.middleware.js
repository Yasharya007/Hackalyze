//Middleware to calculate total score, grade, and result before saving
export const  calculateSubmissionDetails=function (next) {
    if (!this.scores || this.scores.length === 0) {
        this.totalScore = 0;
        this.grade = "Low";
        this.result = "Rejected";
    } else {
        // Calculate total score dynamically
        this.totalScore = this.scores.reduce((sum, item) => sum + item.score, 0);

        // Assign grade based on total score
        if (this.totalScore <= 3.5) {
            this.grade = "Low";
            this.result = "Rejected";
        } else if (this.totalScore <= 6.5) {
            this.grade = "Mid";
            this.result = "Revisit to check its potential";
        } else {
            this.grade = "High";
            this.result = "Shortlisted for the final";
        }
    }
    next();
}
