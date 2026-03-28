/**
 * Minimal valid WAV (mono, 16-bit, 44100 Hz, ~0.05s silence).
 * Used as placeholder for all breath cues until premium assets are added.
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'audio');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const sampleRate = 44100;
const numSamples = 2205;
const dataSize = numSamples * 2;
const buffer = Buffer.alloc(36 + dataSize);
let offset = 0;
function writeU32(v) {
  buffer.writeUInt32LE(v, offset);
  offset += 4;
}
function writeU16(v) {
  buffer.writeUInt16LE(v, offset);
  offset += 2;
}

buffer.write('RIFF', 0);
offset = 4;
writeU32(36 + dataSize);
buffer.write('WAVE', offset); offset += 4;
buffer.write('fmt ', offset); offset += 4;
writeU32(16);
writeU16(1);
writeU16(1);
writeU32(sampleRate);
writeU32(sampleRate * 2);
writeU16(2);
writeU16(16);
buffer.write('data', offset); offset += 4;
writeU32(dataSize);

const names = [
  'metronome_click', 'piano_c4', 'piano_d4', 'piano_e4', 'piano_f4',
  'warm_low', 'warm_mid', 'airy_high', 'airy_mid',
];
names.forEach((name) => {
  fs.writeFileSync(path.join(dir, name + '.wav'), buffer);
});
console.log('Created 9 placeholder WAV files in assets/audio/');
