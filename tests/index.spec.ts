import BatchedPromise, { BatchedPromiseCallbackFn } from "../src/index";

// Set long timeout
jest.setTimeout(15000);

const testPromise = async <T>(type: "resolve" | "reject", value: T, timeout = 2000) => {
  await new Promise((r) => setTimeout(r, timeout));
  if (type === "resolve") return Promise.resolve(value);
  return Promise.reject(`${value} rejected`);
};

const asyncFnAllResolve = [
  () => testPromise("resolve", 1, 400),
  () => testPromise("resolve", 2, 350),
  () => testPromise("resolve", 3, 150),
  () => testPromise("resolve", 4, 150),
  () => testPromise("resolve", 5, 123),
  () => testPromise("resolve", 6, 26),
  () => testPromise("resolve", 7, 230),
  () => testPromise("resolve", 8, 350),
];

const asyncFnSomeReject = [
  () => testPromise("resolve", 1, 400),
  () => testPromise("resolve", 2, 150),
  () => testPromise("reject", 3, 123),
  () => testPromise("resolve", 4, 26),
];

describe("BatchedPromise.all() tests", () => {
  it("should run async functions in batches", async () => {
    const batchSize = 3;
    const batchLength = Math.ceil(asyncFnAllResolve.length / batchSize);

    const callback: BatchedPromiseCallbackFn<typeof asyncFnAllResolve[number]> = (currentBatch, idx, currentResult) => {
      expect(currentBatch[0]).toBe(idx * batchSize + 1);
      for (const el of currentBatch) {
        expect(currentResult).toContain(el);
      }
      if (idx === batchLength - 1) {
        expect(currentBatch.length).toBe(asyncFnAllResolve.length % batchLength);
      }
    };
    await BatchedPromise.all(asyncFnAllResolve, batchSize, callback);

    expect.assertions(batchLength + asyncFnAllResolve.length + 1);
  });

  it("should run callback after each batch", async () => {
    const batchSize = 3;
    const batchLength = Math.ceil(asyncFnAllResolve.length / batchSize);

    const callback: BatchedPromiseCallbackFn<typeof asyncFnAllResolve[number]> = (currentBatch, idx, currentResult) => {
      expect(idx).toBe(idx);
    };
    await BatchedPromise.all(asyncFnAllResolve, batchSize, callback);

    expect.assertions(batchLength);
  });

  it("should divide input into correct number of batches", async () => {
    const batchSize = 2;
    const batchLength = Math.ceil(asyncFnAllResolve.length / batchSize);

    const callback: BatchedPromiseCallbackFn<typeof asyncFnAllResolve[number]> = (currentBatch, idx, currentResult) => {
      expect(idx).toBe(idx);
    };
    await BatchedPromise.all(asyncFnAllResolve, batchSize, callback);

    expect.assertions(batchLength);
  });

  it("should behave the same with Promise.all() when batchSize param is undefined", async () => {
    const result = await BatchedPromise.all(asyncFnAllResolve);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(asyncFnAllResolve.length);
    await expect(async () => await BatchedPromise.all(asyncFnSomeReject)).rejects.toEqual("3 rejected");
  });

  it("should rejects when one is rejected", async () => {
    const batchSize = 2;
    await expect(async () => await BatchedPromise.all(asyncFnSomeReject, batchSize)).rejects.toEqual("3 rejected");
  });
});

describe("BatchedPromise.allSettled() tests", () => {
  it("should run async functions in batches", async () => {
    const batchSize = 3;
    const batchLength = Math.ceil(asyncFnAllResolve.length / batchSize);
    const callback: BatchedPromiseCallbackFn<typeof asyncFnAllResolve[number]> = (currentBatch, idx, currentResult) => {
      if (currentBatch[0].status !== "fulfilled") fail("it should never reach this");
      expect(currentBatch[0].value).toBe(idx * batchSize + 1);
      for (const el of currentBatch) {
        expect(currentResult).toContain(el);
      }
      if (idx === batchLength - 1) {
        expect(currentBatch.length).toBe(asyncFnAllResolve.length % batchLength);
      }
    };
    await BatchedPromise.allSettled(asyncFnAllResolve, batchSize, callback);

    expect.assertions(batchLength + asyncFnAllResolve.length + 1);
  });

  it("should run callback after each batch", async () => {
    const batchSize = 3;
    const batchLength = Math.ceil(asyncFnAllResolve.length / batchSize);

    const callback: BatchedPromiseCallbackFn<typeof asyncFnAllResolve[number]> = (currentBatch, idx, currentResult) => {
      expect(idx).toBe(idx);
    };
    await BatchedPromise.allSettled(asyncFnAllResolve, batchSize, callback);

    expect.assertions(batchLength);
  });

  it("should divide input into correct number of batches", async () => {
    const batchSize = 2;
    const batchLength = Math.ceil(asyncFnAllResolve.length / batchSize);

    const callback: BatchedPromiseCallbackFn<typeof asyncFnAllResolve[number]> = (currentBatch, idx, currentResult) => {
      expect(idx).toBe(idx);
    };
    await BatchedPromise.allSettled(asyncFnAllResolve, batchSize, callback);

    expect.assertions(batchLength);
  });

  it("should behave the same with Promise.allSettled() when batchSize param is undefined", async () => {
    const goodResult = await BatchedPromise.allSettled(asyncFnAllResolve);
    expect(goodResult).toBeInstanceOf(Array);
    expect(goodResult.length).toBe(asyncFnAllResolve.length);

    const badResult = await BatchedPromise.allSettled(asyncFnSomeReject);
    expect(badResult).toContainEqual({
      status: "rejected",
      reason: "3 rejected",
    });
    expect(badResult.length).toBe(asyncFnSomeReject.length);
  });

  it("should contain rejected promise when one is rejected", async () => {
    const batchSize = 2;
    const result = await BatchedPromise.allSettled(asyncFnSomeReject, batchSize);
    expect(result).toContainEqual({
      status: "rejected",
      reason: "3 rejected",
    });
  });
});
