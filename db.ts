import 'dotenv/config';

import Airtable from 'airtable';

Airtable.configure({
    apiKey: process.env["AIRTABLE_KEY"]
});

const base = Airtable.base(process.env["AIRTABLE_BASE"] as string);

interface DatabaseResourceData {
    [key: string]: unknown;
}

class DatabaseResource {

    constructor(
        private id: any,
        private tableName: string, 
        private data: DatabaseResourceData
        ) {
        this.id = id;
        this.tableName = tableName;
        this.data = data; 
    }

    public upload() {

    }

    public static createAirtableFormulaFromObject(obj: DatabaseResourceData): string {
        const entries = Object.entries(obj);
        let results = 'AND(';

        entries.forEach(([k, v], index) => { 
            if (typeof v === "string") {
                results += `{${k}} = '${v}'`;
            } else {
                results += `{${k}} = ${v}`;
            }
            if (index < entries.length - 1) {
                results += ", ";
            }
        });

        results += ')';
        return results;
    }

    public get resourceData(): DatabaseResourceData {
        return this.data;
    }

    static retrieve(tableName: string, filter: DatabaseResourceData, single: boolean): Promise<DatabaseResource | DatabaseResource[]>   {
        const formula = DatabaseResource.createAirtableFormulaFromObject(filter);
        
        return new Promise((resolve, reject) => {
            base(tableName).select({
                filterByFormula: formula,
                maxRecords: 100,
                view: "Grid view"
            }).firstPage((err, records) => {
                if (err) { reject(err) }

                if (records !== undefined && records[0] !== undefined && single === true) {
                    resolve(new DatabaseResource(records[0].getId(), tableName, records[0].fields))
                } else if (records !== undefined){
                    const results: DatabaseResource[] = [];
                    records.forEach(r => {
                        if (r !== undefined) {
                            results.push(new DatabaseResource(r.getId(), tableName, r.fields));
                        }
                    });

                    resolve(results);
                }
            });
        });
    }

}

export {
    DatabaseResource,
    DatabaseResourceData
}