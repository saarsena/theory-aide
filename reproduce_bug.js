
const token = "__JSON__";
const data = { name: "$&" };
const json = JSON.stringify(data);
const html = "var x = __JSON__;";
const result = html.replace(token, json);
console.log("Result:", result);
if (result.includes(token)) {
    console.log("BUG DETECTED: Token still present in result!");
}
