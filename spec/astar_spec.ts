import { Astar, GraphNode, IGraphEdge, IGraphPath } from '../src/astar';

describe("The A* search object", function () {
	/*
	 * After 0 steps
	 *     a   b   c   d   e   f
	 * a   -   1   3   -   -   -
	 * b   1   1   1   3   -   -
	 * c   3   1   -   1   1   -
	 * d   -   3   1   -   1   -
	 * e   -   -   1   1   -   -
	 * f   -   -   -   -   1   -
	 */
	var allEdges = [
		{ from: "a", to: "b", cost: 1 },
		{ from: "a", to: "c", cost: 3 },
		{ from: "b", to: "b", cost: 1 }, // This is an attempt to cause trouble. (Intentionally)
		{ from: "b", to: "a", cost: 1 },
		{ from: "b", to: "c", cost: 1 },
		{ from: "b", to: "d", cost: 3 },
		{ from: "c", to: "a", cost: 3 },
		{ from: "c", to: "b", cost: 1 },
		{ from: "c", to: "d", cost: 1 },
		{ from: "c", to: "e", cost: 1 },
		{ from: "d", to: "b", cost: 3 },
		{ from: "d", to: "c", cost: 1 },
		{ from: "d", to: "e", cost: 1 },
		{ from: "e", to: "c", cost: 1 },
		{ from: "e", to: "d", cost: 1 },
		{ from: "f", to: "e", cost: 1 }
	];

	function generateAllNodes(): GraphNode[] {
		var seen: {[key: string]: true} = {};
		var nodeList: GraphNode[] = [];

		function checkAndAdd(node: GraphNode) {
			if (!seen[node]) {
				seen[node] = true;
				nodeList.push(node);
			}
		}

		allEdges.forEach(function (edge) {
			checkAndAdd(edge.from);
			checkAndAdd(edge.to);
		});

		return nodeList;
	}

	function exitArcsForNodeId(node: GraphNode): IGraphEdge[] {
		return allEdges.filter((edge) => edge.from === node);
	}

	const allNodes = generateAllNodes();

	describe("Async API", function () {
		let astar: Astar;

		let callbackFuncs = {
			exitArcsForNodeId,
		};

		beforeAll(function () {
			astar = new Astar(callbackFuncs);
		});

		it("should have a default heuristic h() function that returns 0 for all possible connections", function () {
			var h = astar.h;

			var promises = [];
			allNodes.forEach(function (from) {
				allNodes.forEach(function (to) {
					expect(h(from, to)).toBe(0);
				});
			});
		});

		it("should return an empty path with 0 cost when start and end node are identical", function (done) {
			var search = astar.findPath("a", "a");

			search.then((path: IGraphPath) => {
				expect(path.cost).toBe(0);
				expect(path.path).toEqual([]);

				done();
			}).catch(function (reason) {
				fail("Unexpected error executing findPath: " + reason);
			});
		});

		it("should return an empty path with 0 cost when start and end node are identical with custom goalFunc", function (done) {
			function aGoalFunc(node: GraphNode) {
				return node === "a";
			}
			var search = astar.findPath("a", aGoalFunc);

			search.then(function (path) {
				expect(path.cost).toBe(0);
				expect(path.path).toEqual([]);

				done();
			}).catch(function (reason) {
				fail("Unexpect error executing findPath: " + reason);
			});
		});

		it("should return a correct path and cost when start and end node are neighbors", function (done) {
			var search = astar.findPath("a", "b");

			search.then(function (path) {
				expect(path.cost).toBe(1);
				expect(path.path).toEqual([
					{ from: "a", to: "b", cost: 1 }
				]);

				done();
			}).catch(function (reason) {
				fail("Unexpect error executing findPath: " + reason);
			});
		});

		it("should return a correct path and cost when start and end node are neighbors with custom goalFunc", function (done) {
			function aGoalFunc(node: GraphNode) {
				return node === "b";
			}
			var search = astar.findPath("a", aGoalFunc);

			search.then(function (path) {
				expect(path.cost).toBe(1);
				expect(path.path).toEqual([
					{ from: "a", to: "b", cost: 1 }
				]);

				done();
			}).catch(function (reason) {
				fail("Unexpect error executing findPath: " + reason);
			});
		});

		it("should return a nice error message when there is no path to the goal", function (done) {
			astar.findPath("a", "f")
				.then(function(path) {
					fail("Got an unexpected path");
				}).catch(function (reason) {
					expect(reason).toBe("No path to goal");
					done();
				});
		});

	});
});
