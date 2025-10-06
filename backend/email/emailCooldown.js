class EmailCooldown {
  constructor() {
    this.lastEmailSent = new Map();
    this.cooldownPeriod = 5 * 60 * 1000; // 5 minutes en millisecondes
  }

  canSendEmail(type) {
    const now = Date.now();
    const lastSent = this.lastEmailSent.get(type) || 0;
    
    if (now - lastSent >= this.cooldownPeriod) {
      this.lastEmailSent.set(type, now);
      return true;
    }
    return false;
  }

  getTimeUntilNextEmail(type) {
    const now = Date.now();
    const lastSent = this.lastEmailSent.get(type) || 0;
    const timeLeft = this.cooldownPeriod - (now - lastSent);
    return Math.max(0, Math.ceil(timeLeft / 1000)); // Retourne en secondes
  }
}

module.exports = new EmailCooldown();
