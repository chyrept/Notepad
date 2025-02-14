import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, Form } from "@remix-run/react";
import { TodoManager } from "~/to-do-manager";

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const todoManager = new TodoManager(
    context.cloudflare.env.TO_DO_LIST,
    params.id,
  );
  const todos = await todoManager.list();
  return { todos };
};

export async function action({ request, context, params }: ActionFunctionArgs) {
  const todoManager = new TodoManager(
    context.cloudflare.env.TO_DO_LIST,
    params.id,
  );
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const text = formData.get("text");
      if (typeof text !== "string" || !text)
        return Response.json({ error: "Invalid text" }, { status: 400 });
      await todoManager.create(text);
      return { success: true };
    }

    case "toggle": {
      const id = formData.get("id") as string;
      await todoManager.toggle(id);
      return { success: true };
    }

    case "delete": {
      const id = formData.get("id") as string;
      await todoManager.delete(id);
      return { success: true };
    }

    default:
      return Response.json({ error: "Invalid intent" }, { status: 400 });
  }
}

export default function () {
  const { todos } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-6">
          Todo List
        </h1>

        <Form method="post" className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-inner">
          <input
            type="text"
            name="text"
            className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-gray-800 dark:text-white"
            placeholder="Add a new task..."
          />
          <button
            type="submit"
            name="intent"
            value="create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Add
          </button>
        </Form>

        <ul className="mt-4 space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              <Form method="post" className="flex-1 flex items-center gap-2">
                <input type="hidden" name="id" value={todo.id} />
                <button
                  type="submit"
                  name="intent"
                  value="toggle"
                  className="flex-1 text-left text-lg font-medium text-gray-800 dark:text-white"
                >
                  <span
                    className={
                      todo.completed
                        ? "line-through text-gray-500 dark:text-gray-400"
                        : ""
                    }
                  >
                    {todo.text}
                  </span>
                </button>
              </Form>
              <Form method="post">
                <input type="hidden" name="id" value={todo.id} />
                <button
                  type="submit"
                  name="intent"
                  value="delete"
                  className="text-red-500 hover:text-red-700"
                >
                  ✖
                </button>
              </Form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
