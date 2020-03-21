function solve(workerObj) {
    if (workerObj.dizziness) {
        workerObj.levelOfHydrated += workerObj.weight * workerObj.experience * 0.1;
        workerObj.dizziness = false;
    }

    return workerObj;
}
