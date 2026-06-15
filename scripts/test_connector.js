import * as fs from "fs";
import { runMLModel } from "../src/ml/mlConnector.js";
const email = fs.readFileSync("scripts/test_email.txt", "utf8");
console.log(runMLModel(email));
