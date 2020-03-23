"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var axios_1 = __importDefault(require("axios"));
var defaultState = {
    data: null,
    loading: false,
    error: false,
};
function useAxiosMulti(configs, transformers, axiosPromiseConstructor, options) {
    var _this = this;
    var _a = react_1.useState(defaultState), state = _a[0], setState = _a[1]; // simple one time fetch (either - or basis)
    var _b = react_1.useState(0), redo = _b[0], setRedo = _b[1]; // simple one time fetch (either - or basis)
    var _c = react_1.useState(defaultState), intervalState = _c[0], setIntervalState = _c[1]; // interval fetch (either - or basis)
    var skip = options.skip, pollingInterval = options.pollingInterval;
    var handleIncrementRedo = function () {
        setRedo((redo + 1) % 2);
    };
    react_1.useEffect(function () {
        var source = axios_1.default.CancelToken.source();
        var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
            var resultData_1, promises, results, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (pollingInterval)
                            setIntervalState({ error: false, loading: true, data: null });
                        else
                            setState({ error: false, loading: true, data: null });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        resultData_1 = [];
                        promises = configs.map(function (config) { return axiosPromiseConstructor(config, source.token); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        results = _a.sent();
                        results.forEach(function (result, index) {
                            resultData_1.push(transformers[index](result.data));
                        });
                        if (pollingInterval)
                            setIntervalState({ error: false, loading: false, data: resultData_1 });
                        else
                            setState({ error: false, loading: false, data: resultData_1 });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        if (axios_1.default.isCancel(error_1)) {
                            // console.warn('FetchError - is cancel', error)
                            // do something when axios is cancelled
                        }
                        else {
                            // console.warn('FetchError: , ', error)
                            if (pollingInterval)
                                setIntervalState({ error: true, loading: false, data: null });
                            else
                                setState({ error: true, loading: false, data: null });
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        var id;
        if (!skip && !pollingInterval) {
            loadData();
            return function () {
                source.cancel();
            };
        }
        if (!skip && pollingInterval) {
            if (!intervalState.data) {
                // if no data at hand, initialize fetch just like in a normal case
                loadData();
            }
            else {
                // start polling on the second rount
                id = setInterval(loadData, pollingInterval);
            }
        }
        return function () {
            // polling cleanup
            clearInterval(id);
            source.cancel();
        };
    }, [redo, skip, intervalState.data]); // watch for intervalData especially because refetch is required after each poll
    return intervalState.data
        ? [
            {
                data: intervalState.data,
                error: intervalState.error,
                loading: intervalState.loading,
            },
            { redo: handleIncrementRedo },
        ]
        : state.data
            ? [
                { data: state.data, error: state.error, loading: state.loading },
                { redo: handleIncrementRedo },
            ]
            : [
                { data: null, error: state.error, loading: state.loading },
                { redo: handleIncrementRedo },
            ];
}
exports.useAxiosMulti = useAxiosMulti;
