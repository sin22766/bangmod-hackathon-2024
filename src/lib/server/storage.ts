import { DeleteObjectsCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import { S3_ACCESS_KEY, S3_BUCKET_NAME, S3_ENDPOINT, S3_SECRET_KEY } from '$env/static/private';

const S3 = new S3Client({
	region: 'auto',
	endpoint: S3_ENDPOINT,
	credentials: {
		accessKeyId: S3_ACCESS_KEY,
		secretAccessKey: S3_SECRET_KEY
	}
});

// Add limit size to 5 MB on serverside
const UploadFile = async (path: string, file: File | null) => {
	if (!file?.size) {
		throw new Error('File is not valid');
	} else if (file.size > 5242880) {
		throw new Error('File is larger than 5 MB');
	}

	const command = new Upload({
		client: S3,
		params: {
			Bucket: S3_BUCKET_NAME,
			Key: path,
			Body: file
		}
	});

	// const command = new PutObjectCommand({
	// 	Bucket: S3_BUCKET_NAME,
	// 	Key: filePath,
	// 	Body: await file.arrayBuffer() as Buffer
	// });

	return command.done();
};

const DeleteMultiple = async (path: string[]) => {
	const command = new DeleteObjectsCommand({
		Bucket: S3_BUCKET_NAME,
		Delete: {
			Objects: path.map((i) => {
				return { Key: i };
			})
		}
	});

	return S3.send(command);
};

export { S3, UploadFile, DeleteMultiple };
