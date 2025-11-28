import { cn } from "@/lib/utils";

function GridCell({ walls, markerColor, markerClass }) {
  return (
    <div
      className={cn(
        "flex justify-center items-center p-2",
        walls.top ? "border-t" : "",
        walls.right ? "border-r" : "",
        walls.bottom ? "border-b" : "",
        walls.left ? "border-l" : ""
      )}
    >
      {markerColor && (
        <div className={`${markerColor} w-full h-full rounded-md ${markerClass}`}></div>
      )}
    </div>
  );
}

export default GridCell;
