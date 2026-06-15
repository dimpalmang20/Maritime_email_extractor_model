import { spawnSync } from "child_process";

export function runMLModel(
  emailText: string
) {

  console.log("STARTING PYTHON");

const result = spawnSync(
  "python",
  ["src/ml/predict.py"],
  {
    input: emailText,
    encoding: "utf8"
  }
);

console.log("PYTHON FINISHED");

console.log("STDOUT:");
console.log(result.stdout);

console.log("STDERR:");
console.log(result.stderr);

  if (result.error) {
    return {};
  }

  try {
    return JSON.parse(
      result.stdout
    );
  }
  catch {
    return {};
  }
}