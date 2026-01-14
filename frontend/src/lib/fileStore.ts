class FileStore {
    private file: File | null = null;

    setFile(file: File) {
        this.file = file;
    }

    getFile(): File | null {
        return this.file;
    }

    clearFile() {
        this.file = null;
    }
}

const fileStore = new FileStore();
export default fileStore;
