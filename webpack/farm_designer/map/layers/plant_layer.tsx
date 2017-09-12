import * as React from "react";
import { Link } from "react-router";
import * as _ from "lodash";
import { GardenPlant } from "../garden_plant";
import { PlantLayerProps, CropSpreadDict } from "../interfaces";
import { defensiveClone } from "../../../util";
import { history } from "../../../history";

const cropSpreadDict: CropSpreadDict = {};

export function PlantLayer(props: PlantLayerProps) {
  const {
    crops,
    plants,
    dispatch,
    visible,
    currentPlant,
    dragging,
    editing,
    mapTransformProps,
    plantAreaOffset
  } = props;

  crops
    .filter(c => !!c.body.spread)
    .map(c => cropSpreadDict[c.body.slug] = c.body.spread);

  const maybeNoPointer = history.getCurrentLocation().pathname.split("/")[6] == "add"
    ? { "pointerEvents": "none" } : {};

  if (visible) {
    return <g>
      {plants
        .filter(x => !!x.body.id)
        .map(p => defensiveClone(p))
        .map(p => {
          return p;
        })
        .map(p => {
          return {
            selected: !!(currentPlant && (p.uuid === currentPlant.uuid)),
            plantId: (p.body.id || "IMPOSSIBLE_ERR_NO_PLANT_ID").toString(),
            uuid: p.uuid,
            plant: p
          };
        })
        .map(p => {
          const action = { type: "SELECT_PLANT", payload: p.uuid };
          return <Link className="plant-link-wrapper"
            style={maybeNoPointer}
            to={"/app/designer/plants/" + p.plantId}
            id={p.plantId}
            onClick={_.noop}
            key={p.plantId}>
            <GardenPlant
              mapTransformProps={mapTransformProps}
              plant={p.plant}
              selected={p.selected}
              dragging={p.selected && dragging && editing}
              onClick={() => dispatch(action)}
              dispatch={props.dispatch}
              zoomLvl={props.zoomLvl}
              activeDragXY={props.activeDragXY}
              activeDragSpread={props.activeDragSpread}
              plantAreaOffset={plantAreaOffset} />
          </Link>;
        })}
    </g>;
  } else {
    return <g />;
  }
}
