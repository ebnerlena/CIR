'use server';

import { LOGS_DIR } from '@/constants';
import { STUDY_ROUND } from '@/types/StudyRound';
import dayjs from 'dayjs';
import { readFile, writeFile } from 'fs/promises';

import path from 'path';

export async function writeLog(
	startTime?: Date,
	uuid?: string,
	joke?: string,
	smileDegree?: number,
	studyRound?: STUDY_ROUND,
) {
	try {
		const date = dayjs(startTime).format('YYYYMMDDHHmm');
		const fileName = `${date}_${uuid}_${studyRound}.json`;
		const filePath = path.join(LOGS_DIR, fileName);

		let logs = [];

		try {
			const data = await readFile(filePath, 'utf8');
			logs = JSON.parse(data);
		} catch (parseError: any) {
			// Expecting here the error that file is not found - continue in function
			if (parseError.code === 'ENOENT') {
				console.error('File not found. Creating a new one...');
			} else {
				console.error('Unknown Error:', parseError);
				return;
			}
		}

		const newLogEntry = {
			timestamp: new Date().toISOString(),
			joke: joke,
			smileDegree: smileDegree,
		};
		logs.push(newLogEntry);

		const updatedLogsJson = JSON.stringify(logs, null, 2);

		logs.push(newLogEntry);

		await writeFile(filePath, updatedLogsJson);

		return { message: 'Log successfully written.' };
	} catch (e) {
		// eslint-disable-next-line no-console
		console.log('Error occured:', e);
		throw Error('There was an error logging the data..');
	}
}

// const createZipArchive = (targetDir: string) => {
// 	const zipFileName = `/${targetDir.split('/uploads')[1]}.zip`;

// 	const files = readdirSync(targetDir);

// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	const fileContents = files.reduce((acc: any, file) => {
// 		const filePath = path.join(targetDir, file);
// 		const fileBuffer = readFileSync(filePath);
// 		const fileUint8Array = new Uint8Array(fileBuffer);
// 		acc[file] = fileUint8Array;
// 		return acc;
// 	}, {});

// 	const zipped = zipSync(fileContents);
// 	const outputPath = path.join(DOWNLOADS_DIR, zipFileName);

// 	writeFileSync(outputPath, zipped);
// };
