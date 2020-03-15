function solve() {
    return (() => {
        let pNum = 0;
        let lNum = 1;

        return () => {
            lNum = pNum + (pNum = lNum);

            return pNum;
        }
    })()
}
