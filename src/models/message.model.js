const { Schema, model, models } = require('mongoose');

// ── Process step (Received / Validated / Processed / Delivered) ────
const ProcessStepSchema = new Schema(
  {
    label: { type: String, default: null },
    done:  { type: Boolean, default: false },
  },
  { _id: false }
);

// ── Root message document ──────────────────────────────────────────
const MessageSchema = new Schema(
  {
    id:            { type: Number, required: true, unique: true },
    code:          { type: String, required: true, unique: true, trim: true },
    nameCode:      { type: String, default: null },
    secondaryCode: { type: String, default: null },

    status:      { type: String, default: null },
    statusLabel: { type: String, default: null },

    msgType:    { type: String, default: null },
    msgSubType: { type: String, default: null },

    conversationId: { type: Number, default: null },
    refMsgId:       { type: String, default: null },
    idempotency:    { type: String, default: null },

    port: { type: String, default: null },
    trip: { type: String, default: null },

    sender:              { type: String, default: null },
    senderId:            { type: Number, default: null },
    senderConnector:     { type: String, default: null },
    senderConnectorId:   { type: Number, default: null },
    senderChannel:       { type: String, default: null },
    senderChannelId:     { type: Number, default: null },

    receiver:            { type: String, default: null },
    receiverId:          { type: Number, default: null },
    receiverConnector:   { type: String, default: null },
    receiverConnectorId: { type: Number, default: null },
    receiverChannel:     { type: String, default: null },
    receiverChannelId:   { type: Number, default: null },

    sentAt:        { type: Date, default: null },
    sentTime:      { type: String, default: null },
    processedAt:   { type: Date, default: null },
    receivedAt:    { type: Date, default: null },

    processSteps: { type: [ProcessStepSchema], default: [] },
    attachments:  { type: Schema.Types.Mixed, default: [] },

    // payload — flexible EDIFACT/JSON structure stored as Mixed
    payload: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: false, versionKey: false }
);

MessageSchema.index({ conversationId: 1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1 });
MessageSchema.index({ sentAt: -1 });

module.exports = models['Message'] || model('Message', MessageSchema);
