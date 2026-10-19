import React from "react";

export const Layer = ({
  begin = 0,
  end = 0,
  time = 0,
  delta = 0,
  children,
  continuous = false
}) => {
  const active = continuous || (time >= begin && time <= end);

  if (!active) {
    return null;
  }

  return React.Children.map(children, (child) =>
    React.cloneElement(child, {
      time,
      delta
    })
  );
};
