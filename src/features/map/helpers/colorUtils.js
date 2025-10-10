export const colorUtils = {
  getColorForScore(score) {
    // Ensure score is between 0 and 1
    const normalizedScore = Math.max(0, Math.min(1, score));
    
    if (normalizedScore < 0.2) {
      return '#ff4444'; // Red for low scores
    } else if (normalizedScore < 0.4) {
      return '#ff8844'; // Orange
    } else if (normalizedScore < 0.6) {
      return '#ffcc44'; // Yellow
    } else if (normalizedScore < 0.8) {
      return '#88cc44'; // Light green
    } else {
      return '#44cc44'; // Green for high scores
    }
  }
}; 