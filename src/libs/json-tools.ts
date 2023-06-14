import * as fs from 'fs';

function splitJsonFile (filePath: string, length: number): void {
    // Read the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Split the array into chunks of specified length
    const chunks = [];
    for (let i = 0; i < data.length; i += length) {
        const chunk = data.slice(i, i + length);
        chunks.push(chunk);
    }

    // Write each chunk to separate files
    chunks.forEach((chunk, index) => {
        const chunkFilename = `${filePath}-${index + 1}.json`;
        const chunkContent = JSON.stringify(chunk, null, 2);
        fs.writeFileSync(chunkFilename, chunkContent);
    });
};
splitJsonFile("data/testnet/accounts.json", 50);
