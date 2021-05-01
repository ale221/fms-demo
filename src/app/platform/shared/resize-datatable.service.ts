
export class ResizeDatatableService {

  recalculate() {

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 10);
  }
}
