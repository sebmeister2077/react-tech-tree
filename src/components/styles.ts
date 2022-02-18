import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme)=>({
    treeRoot: (props: any) => ({
        background: "purple",
        padding: "8px",
        position: "relative",
        transform: `rotate(${props.transform ?? 0})`,
    }),
    layer: {
        display: "flex",
        padding: "8px",
        gap: "2px",
    },
    defaultNode: {
        aspectRatio: "1/1",
        width: "50px",
        border: "2px solid black",
        padding: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        userSelect: "none",
    },
    elementContainer: (props: any) => ({
        position: "relative",
        display: "flex",
        justifyContent: "center",
        transform:`rotate(-${props.transform ?? 0})`
    })
}))