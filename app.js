const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const statusProperties = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const priorityProperties = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const statusAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

/*const responseTodoTable = (eachAction) => {
  return {
    todoId: eachAction.id,
    todo: eachAction.todo,
    priority: eachAction.priority,
    status: eachAction.status,
  };
};*/

//Getting all TODO'S having status TO DO

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getTodoQuery = "";
  switch (true) {
    case statusAndPriorityProperties(request.query):
      getTodoQuery = `SELECT * FROM todo 
          WHERE todo LIKE '%${search_q}%'
          AND priority = "${priority}" 
          AND status = "${status}";`;
      break;
    case priorityProperties(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;

    case statusProperties(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;
    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%";`;
  }
  let todoArray = await database.all(getTodoQuery);
  response.send(todoArray);
});

module.exports = app;
