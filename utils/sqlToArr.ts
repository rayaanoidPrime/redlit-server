import * as fs from "fs";

interface Post {
  title: string;
  text: string;
  authorId: number;
}

export const parseSqlFile = (filePath: string): Post[] => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const insertStatements = fileContent.match(/insert into Post.*\);/gi);
  const posts: Post[] = [];

  if (insertStatements) {
    insertStatements.forEach((insertStatement) => {
      const valuesStartIndex = insertStatement.indexOf("values (") + 8;
      const valuesEndIndex = insertStatement.length - 2;
      const values = insertStatement.substring(valuesStartIndex, valuesEndIndex);
      const valuesArray = values.split(",").map((value) => value.trim().replace(/'/g, ""));
      const post: Post = {
        title: valuesArray[0],
        text: valuesArray[1],
        authorId: 4,
      };
      posts.push(post);
    });
  }

  return posts;
}
