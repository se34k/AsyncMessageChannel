# AsyncMessagePort
This project provides a simple wrapper around JavaScript's [`MessagePort`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort) interface. Its purpose is to make the Channel Messaging API available for use with ES6 `await` syntax.

## Usage
To use `await` syntax with a `MessagePort`, simply create a new `AsyncMessagePort` object by passing it the original `MessagePort` object:
```js
const asyncPort = new AsyncMessagePort(port)
```

You can then simply use the `postMessage()` function just like you would with the regular port - just that it is an `async` function now:

```js
const answer = await asyncPort.postMessage("your_message")
```

The returned `Promise` resolves with an `AsyncMessage` object - its `data` property contains the message sent from the other side of the port, and you can call `postAnswer()` to send an answer to the message (and receive an answer to your answer in return, just like `postMessage()`):

```js
const answer2 = await answer.postAnswer("your_answer")
```

To react to messages not sent as a response to a previous message, you need to add a message listener:

```js
asyncPort.addMessageListener(async (message) => {
    const result = doSomethingWithTheMessage(message.data);

    m.postAnswer({result:result});
})
```
You can remove an existing message listener by calling `removeMessageListener(callback)`.

> [!IMPORTANT]
> Remember not to use `await` with calls where you do not expect an answer, as the `Promise` will never be resolved if your message is never answered.

If you want to create a `MessageChannel` manually, this project offers a simple wrapper for this function, too. Simply call `new AsyncMessageChannel()`, and the resulting object's `port1` and `port2` properties will contain `AsyncMessageChannel` wrappers over the ports of a new `MessageChannel`.

## What problem this solves
Using the Channel Messaging API usually involves using `postMessage()` to send messages and setting up an `onmessage` event listener to handle any responses. While this works fine in simple use cases, for example using a `Worker` to solve a single mathematical problem and send back the solution, it is insufficient when more complex behavior is implemented. Consider the following example, where we send two tasks to a `SharedWorker` and need to handle its responses:

```js
const worker = new SharedWorker('./worker.js');

worker.port.onmessage = (e) => {
    if (e.data.taskId === 1) {
        localStorage.setItem("x", e.data.result);
    } else {
        window.alert(`The solution to task 2 is ${e.data.result}!`);
    }
}

function solveTask1(hash) {
    worker.port.postMessage({
        taskId : 1,
        problem : hash
    });
}
function solveTask2(problem) {
    worker.port.postMessage({
        taskId : 2,
        problem : problem
    });
}
```

Here, we need to explicitly handle different cases, requiring an extra `if` condition for every new task type we introduce. This also makes our code harder to read - the code containing the problem is separated from the code handling the solution.

Using ES6 `await` syntax makes our code much more concise and easier to read:

```js
const worker = new SharedWorker('./worker.js');

const port = new AsyncMessagePort(worker.port);

async function solveTask1(hash) {
    const answer = await port.postMessage({
        taskId : 1,
        problem : hash
    });
    localStorage.setItem("x", answer.data.result);
}

async function solveTask2(problem) {
    const answer = await port.postMessage({
        taskId : 2,
        problem : problem
    });
    window.alert(`The solution to task 2 is ${answer.data.result}!`);
}
```
