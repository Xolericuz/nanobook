import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const storagePath = config.audit.storagePath;
let auditLog = [];
let lastHash = '0000000000000000000000000000000000000000000000000000000000000000';

// Ensure storage directory exists
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

// Generate hash for event
function generateHash(previousHash, data, timestamp) {
  const payload = previousHash + JSON.stringify(data) + timestamp;
  return CryptoJS.SHA256(payload).toString();
}

// Add event to audit log
export function addAuditLog(eventType, data = {}) {
  const timestamp = new Date().toISOString();
  const currentHash = generateHash(lastHash, data, timestamp);

  const entry = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: eventType,
    data,
    timestamp,
    hash: currentHash,
    previous_hash: lastHash
  };

  lastHash = currentHash;
  auditLog.push(entry);

  // Save to file periodically
  if (auditLog.length % 10 === 0) {
    saveToFile();
  }

  return entry;
}

// Get audit log entries
export function getAuditLog(limit = 50) {
  if (limit <= 0) {
    return auditLog;
  }
  return auditLog.slice(-limit);
}

// Verify audit log integrity
export function verifyIntegrity() {
  let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const invalidEntries = [];

  for (const entry of auditLog) {
    // Skip non-BOOK events for verification
    if (!entry.type.startsWith('BOOK_') && !entry.type.startsWith('SYSTEM_')) {
      continue;
    }

    const expectedHash = generateHash(previousHash, entry.data, entry.timestamp);
    
    if (entry.hash !== expectedHash || entry.previous_hash !== previousHash) {
      invalidEntries.push({
        id: entry.id,
        reason: 'Hash mismatch'
      });
    }

    previousHash = entry.hash;
  }

  return {
    valid: invalidEntries.length === 0,
    totalEntries: auditLog.length,
    invalidEntries: invalidEntries.length,
    details: invalidEntries
  };
}

// Save audit log to file
function saveToFile() {
  const filename = `audit_${new Date().toISOString().split('T')[0]}.json`;
  const filepath = path.join(storagePath, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(auditLog.slice(-1000), null, 2));
  console.log(`📝 Audit log saved: ${filename}`);
}

// Load today's audit log from file
export function loadTodayLog() {
  const filename = `audit_${new Date().toISOString().split('T')[0]}.json`;
  const filepath = path.join(storagePath, filename);
  
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    auditLog = data;
    if (auditLog.length > 0) {
      lastHash = auditLog[auditLog.length - 1].hash;
    }
  }
}

// Get audit statistics
export function getAuditStats() {
  const eventTypes = {};
  
  auditLog.forEach(entry => {
    eventTypes[entry.type] = (eventTypes[entry.type] || 0) + 1;
  });

  return {
    totalEntries: auditLog.length,
    lastEvent: auditLog[auditLog.length - 1]?.timestamp,
    eventTypes,
    lastHash
  };
}

// Export audit log (for blockchain-like export)
export function exportAuditLog() {
  return {
    exported_at: new Date().toISOString(),
    version: '1.0.0',
    algorithm: 'SHA256',
    entries: auditLog.map(e => ({
      ...e,
      data: undefined // Don't include raw data in export
    })),
    data_hash: lastHash,
    integrity: verifyIntegrity()
  };
}

// Initialize
loadTodayLog();

// Predefined event types
export const EventTypes = {
  BOOK_CREATED: 'BOOK_CREATED',
  BOOK_UPDATED: 'BOOK_UPDATED',
  BOOK_DELETED: 'BOOK_DELETED',
  USER_ACTION: 'USER_ACTION',
  SYSTEM_START: 'SYSTEM_START',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  UI_UPDATE: 'UI_UPDATE'
};

export default {
  addAuditLog,
  getAuditLog,
  verifyIntegrity,
  getAuditStats,
  exportAuditLog,
  EventTypes
};