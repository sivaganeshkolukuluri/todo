const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3003, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const haspriorityandstatusproperties = (requestquery) => {
  return;
  requestquery.priority !== undefined && requestquery.status !== undefined;
};

const haspriorityproperty = (requestquery) => {
  return requestquery.priority !== undefined;
};

const hasstatusproperty = (requestquery) => {
  return requestquery.status !== undefined;
};

const hascategoryandstatus = (requestquery) => {
  return (
    requestquery.category !== undefined && requestquery.status !== undefined
  );
};

const hascategoryandpriority = (requestquery) => {
  return (
    requestquery.priority !== undefined && requestquery.category !== undefined
  );
};

const hassearchproperty = (requestquery) => {
  return requestquery.search_q !== undefined;
};

const hascategoryproperty = (requestquery) => {
  return requestquery.category !== undefined;
};

const outputresult = (db) => {
  return {
    id: db.id,
    todo: db.todo,
    priority: db.priority,
    category: db.category,
    status: db.status,
    dueDate: db.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let gettodoquery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case haspriorityandstatusproperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          gettodoquery = `SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}';`;
          data = await database.all(gettodoquery);
          response.send(data.map((eachitem) => outputresult(eachitem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hascategoryandstatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          gettodoquery = `select * from todo where category = '${category}' and status = '${status}';`;
          data = await database.all(gettodoquery);
          response.send(data.map((eachitem) => outputresult(eachitem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hascategoryandpriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          gettodoquery = `select * from todo where category = '${category}' and priority = '${priority}';`;
          data = await database.all(gettodoquery);
          response.send(data.map((eachitem) => outputresult(eachitem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case haspriorityproperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        gettodoquery = `SELECT * FROM todo WHERE priority = '${priority}';`;
        data = await database.all(gettodoquery);
        response.send(data.map((eachitem) => outputresult(eachitem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasstatusproperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        gettodoquery = `select * from todo where status = '${status}';`;
        data = await database.all(gettodoquery);
        response.send(data.map((eachitem) => outputresult(eachitem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hassearchproperty(request.query):
      gettodoquery = `select * from todo where todo like '%${search_q}%';`;
      data = await database.all(gettodoquery);
      response.send(data.map((eachitem) => outputresult(eachitem)));
      break;

    case hascategoryproperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        gettodoquery = `select * from todo where category = '${category}';`;
        data = await database.all(gettodoquery);
        response.send(data.map((eachitem) => outputresult(eachitem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      gettodoquery = `select * from todo;`;
      data = await databse.all(gettodoquery);
      response.send(data.map((eachitem) => outputresult(eachitem)));
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const gettodoquery = `select * from todo where id = ${todoId};`;
  const responseResult = await databse.get(gettodoquery);
  response.send(outputresult(responseResult));
});

app.get("/agenda/", async (request, response) => {
  const { data } = request.query;
  console.log(isMatch(data, "yyyy-MM-dd"));
  if (isMatch(data, "yyyy-MM-dd")) {
    const newdate = format(new Date(date), "yyyy-MM-dd");
    console.log(newdate);
    const requestquery = `select * from todo where due_date = '${newdate}';`;
    const responseresult = await database.all(requestquery);
    response.send(responseresult.map((eachitem) => outputresult(eachitem)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postnewduedate = format(new Date(dueDate), "yyyy-MM-dd");
          const posttodoquery = `INSERT INTO 
                        todo (id , todo, category, priority, status, due_date)
                        VALUES 
                        (${id} , '${todo}', '${category} '${priority}' , '${status}' , '${postnewduedate}');`;
          await database.run(posttodoquery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Inavlid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updatedcolum = "";
  const requestbody = request.body;
  console.log(requestbody);
  const previoustodoquery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previoustodo = await database.get(previoustodoquery);
  const {
    todo = previoustodo.todo,
    priority = previoustodo.priority,
    status = previoustodo.status,
    category = previoustodo.category,
    dueDate = previoustodo.dueDate,
  } = request.body;

  let updatetodoquery;
  switch (true) {
    case requestbody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updatetodoquery = `UPDATE todo SET todo = '${todo}' , priority = '${priority}' , status = '${status}', 
                category = '${category}' , due_date = '${dueDate}' WHERE id = ${todoId};`;
        await database.run(updatetodoquery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case requestbody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updatetodoquery = `UPDATE todo SET todo = '${todo}' , priority = '${priority}' , status = '${status}', 
                category = '${category}' , due_date = '${dueDate}' WHERE id = ${todoId};`;
        await database.run(updatetodoquery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestbody.todo !== undefined:
      updatetodoquery = `UPDATE todo SET todo = '${todo}' , priority = '${priority}' , status = '${status}', 
                category = '${category}' , due_date = '${dueDate}' WHERE id = ${todoId};`;
      await database.run(updatetodoquery);
      response.send("Todo Updated");
      break;
    case requestbody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updatetodoquery = `UPDATE todo SET todo = '${todo}' , priority = '${priority}' , status = '${status}', 
                category = '${category}' , due_date = '${dueDate}' WHERE id = ${todoId};`;
        await database.run(updatetodoquery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case requestbody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newduedate = format(new Date(dueDate), "yyyy-MM-dd");
        updatetodoquery = `UPDATE todo SET todo = '${todo}' , priority = '${priority}' , status = '${status}', 
                category = '${category}' , due_date = '${newduedate}' WHERE id = ${todoId};`;

        await database.run(updatetodoquery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletetodoquery = `DELETE FROM todo WHERE id = ${todoId};`;

  await database.run(deletetodoquery);
  response.send("Todo Deleted");
});

module.exports = app;
