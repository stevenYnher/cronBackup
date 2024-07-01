const { MongoClient } = require("mongodb");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

// MongoDB URI
const mongoUri =
  "mongodb+srv://joshue10:07128124@cluster0.vtcx6zh.mongodb.net/";

const client = new MongoClient(mongoUri);

async function backupDatabase() {
  try {
    await client.connect();
    const db = client.db("test");
    const collections = await db.collections();

    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const backupDir = path.join(__dirname, "temp");
    const excelFile = path.join(backupDir, `backup_${timestamp}.xlsx`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();

    for (const collection of collections) {
      const worksheet = workbook.addWorksheet(collection.collectionName);
      const data = await collection.find({}).toArray();

      if (data.length > 0) {
        const columns = Object.keys(data[0]).map((key) => ({
          header: key,
          key,
        }));
        worksheet.columns = columns;

        worksheet.addRows(data);
      }
    }

    await workbook.xlsx.writeFile(excelFile);

    console.log(`Backup saved to ${excelFile}`);

    const backupInfo = {
      timestamp: new Date(),
      excel_file: excelFile,
      backup_type: "full_backup",
    };
    await db.collection("backups").insertOne(backupInfo);

    console.log("Backup info saved");
  } catch (error) {
    console.error("Error during backup:", error);
  } finally {
    await client.close();
  }
}

backupDatabase();
