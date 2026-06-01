import { Client } from '@notionhq/client';

const notion = new Client({ auth: import.meta.env.NOTION_TOKEN });

async function getDataSourceId(database_id: string): Promise<string> {
  const db = await notion.databases.retrieve({ database_id });
  if (!('data_sources' in db) || db.data_sources.length === 0) {
    throw new Error(`No data sources found for database ${database_id}`);
  }
  return db.data_sources[0].id;
}

export async function getProjects() {
  const dataSourceId = await getDataSourceId(import.meta.env.NOTION_PROJECTS_DB);
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
  });
  return response.results;
}

export function mapProject(restult: any){
  return {
    name : restult.properties?.Name?.title?.[0]?.plain_text || '',
    description: restult.properties?.Description?.rich_text?.[0]?.plain_text || '',
    url: restult.properties?.URL?.url || '',
    tech: restult.properties?.Tech?.multi_select?.map((t: any) => t.name) || [],
  }
}