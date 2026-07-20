const drawers = Array.from(document.querySelectorAll(".quick-drawer"));

drawers.forEach(drawer => {
  drawer.addEventListener("toggle", () => {
    if (!drawer.open) return;
    drawers.forEach(otherDrawer => {
      if (otherDrawer !== drawer) otherDrawer.open = false;
    });
  });
});
