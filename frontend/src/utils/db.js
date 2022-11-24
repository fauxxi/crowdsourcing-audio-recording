import Dexie from 'dexie';

export const db = new Dexie('recordingsDB');
db.version(1).stores({
	recording: 'fileId,userId,sessionId,file,blobUrl',
});
