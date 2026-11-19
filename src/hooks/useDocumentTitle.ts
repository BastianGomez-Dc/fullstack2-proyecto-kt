import { useEffect } from "react";

const useDocumentTitle = (titulo: string) => {

    useEffect(() => {
        document.title = titulo;
    }, [titulo]);
}

export default useDocumentTitle;