import fs from 'node:fs';
import path from 'node:path';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load a list of words from a file
const words = fs
	.readFileSync(path.join(__dirname, 'eff_large_wordlist.txt'), 'utf-8')
	.split('\n')
	.map((line) => line.split('\t')[1]) // Extract the word after the tab
	.filter((word) => word); // Remove any undefined or empty entries

function getRandomInt(max: number): number {
	const randomBuffer = randomBytes(4);
	const randomNumber = randomBuffer.readUInt32BE(0);
	return randomNumber % max;
}

export function generatePassword(minLength = 20, maxLength = 48): string {
	let password = '';
	while (password.length < minLength || password.length > maxLength) {
		const wordCount = getRandomInt(5) + 3; // Random word count between 3 and 7
		const selectedWords = [];
		for (let i = 0; i < wordCount; i++) {
			const randomIndex = getRandomInt(words.length);
			selectedWords.push(words[randomIndex].trim());
		}
		password = selectedWords.join(' ');
	}
	return password;
}

export function encrypt(text: string, salt: string): string {
	const key = createHash('sha256').update(salt).digest();
	const iv = randomBytes(16);
	const cipher = createCipheriv('aes-256-cbc', key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedText: string, salt: string): string {
	const key = createHash('sha256').update(salt).digest();
	const [ivHex, encrypted] = encryptedText.split(':');
	const iv = Buffer.from(ivHex, 'hex');
	const decipher = createDecipheriv('aes-256-cbc', key, iv);
	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}
