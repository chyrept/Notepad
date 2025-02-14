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
    <div className="min-h-screen bg-gradient-to-bl from-teal-500 to-blue-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40 transition-transform hover:scale-105">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-6 drop-shadow-md">
          My Tasks
        </h1>

        <Form method="post" className="flex items-center gap-4 bg-white/30 dark:bg-gray-700/50 p-4 rounded-2xl shadow-md border border-white/40">
          <input
            type="text"
            name="text"
            className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
            placeholder="What needs to be done?"
          />
          <button
            type="submit"
            name="intent"
            value="create"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-transform hover:scale-110 shadow-md"
          >
            ➕
          </button>
        </Form>

        <ul className="mt-6 space-y-4">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/50 rounded-xl shadow-md border border-white/30 transition-transform hover:scale-105"
            >
              <Form method="post" className="flex-1 flex items-center gap-3">
                <input type="hidden" name="id" value={todo.id} />
                <button
                  type="submit"
                  name="intent"
                  value="toggle"
                  className="flex-1 text-left text-lg font-medium text-gray-900 dark:text-white"
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
                  className="text-red-500 hover:text-red-700 text-xl transition-transform hover:scale-125"
                >
                  🗑️
                </button>
              </Form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
