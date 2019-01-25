module.exports = {
    zip: (arr1, arr2, callable) => {
        if (!checkArgs(arr1, arr2, callable)) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            callable(arr1[i], arr2[i]);
        }
    },
    zipReduce: (arr1, arr2, callable, initResult) => {
        if (!checkArgs(arr1, arr2, callable)) {
            return false;
        }
        let result = initResult;
        for (let i = 0; i < arr1.length; i++) {
            result = callable(arr1[i], arr2[i], result);
        }
        return result;
    }
};

function checkArgs(arr1, arr2, callable) {
    return arr1.length === arr2.length && typeof callable === 'function';
}