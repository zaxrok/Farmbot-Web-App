class FBToast {
  /**
   * Warnings and errors fire once, to avoid bombarding the user with repetition.
   * Eg: "Can"t connect to server!" might get repetitive.
   */
  static everyMessage: Record<string, boolean> = {};

  public toastEl = document.createElement("div");
  public titleEl = document.createElement("h4");
  public messageEl = document.createElement("div");
  public loaderEl = document.createElement("div");
  public leftLoaderEl = document.createElement("div");
  public rightLoaderEl = document.createElement("div");
  public spinnerLoaderEl = document.createElement("div");

  /** Used to stop a running interval timer */
  public intervalId = 0;

  /**
   * Amount of time before each element is removed.
   */
  public timeout = 7;

  /**
   * Declare if the user's mouse is hovering over the message.
   */
  public isHovered = false;

  constructor(public parent: Element,
    title: string,
    public message: string,
    color: string) {
    /**
    * Fill contents.
    */
    this.titleEl.innerText = title;
    this.messageEl.innerText = message;

    /**
    * Add classes.
    */
    this.toastEl.classList.add("toast");
    this.toastEl.classList.add(color);
    this.titleEl.classList.add("toast-title");
    this.messageEl.classList.add("toast-message");
    this.loaderEl.classList.add("toast-loader");
    this.leftLoaderEl.classList.add("toast-loader-left");
    this.leftLoaderEl.classList.add(color);
    this.rightLoaderEl.classList.add("toast-loader-right");
    this.spinnerLoaderEl.classList.add("toast-loader-spinner");

    this.loaderEl.appendChild(this.leftLoaderEl);
    this.loaderEl.appendChild(this.rightLoaderEl);
    this.loaderEl.appendChild(this.spinnerLoaderEl);
    this.toastEl.appendChild(this.titleEl);
    this.toastEl.appendChild(this.messageEl);
    this.toastEl.appendChild(this.loaderEl);

    /**
     * MouseLeave (resumes the timer).
     */
    this.toastEl.addEventListener("mouseleave", this.mouseLeave);

    /**
     * MouseEnter (pauses the timer).
     */
    this.toastEl.addEventListener("mouseenter", this.mouseEnter);

    /**
     * Click (makes the message go away entirely).
     */
    this.toastEl.addEventListener("click", this.onClick);

  }

  mouseEnter = (e: MouseEvent) => {
    const children = (e.currentTarget as HTMLElement).children[2].children;
    for (let i = 0; i < children.length; i++) {
      (children[i] as HTMLElement).style.animationPlayState = "paused";
    }
    this.isHovered = true;
  };

  mouseLeave = (e: MouseEvent) => {
    const children = (e.currentTarget as HTMLElement).children[2].children;
    for (let i = 0; i < children.length; i++) {
      (children[i] as HTMLElement).style.animationPlayState = "running";
    }
    this.isHovered = false;
  };

  detach = () => {
    this.parent.removeChild(this.toastEl);
    delete FBToast.everyMessage[this.message];
  };

  onClick = (e: MouseEvent) => {
    (e.currentTarget as Element).classList.add("poof");
    setTimeout(this.detach, 200);
  }

  /**
   * Start timer.
   */
  doPolling = () => {
    (this.timeout <= 7) && this.toastEl.classList.add("active");
    (!this.isHovered && this.timeout <= 0.800) && this.toastEl.classList.add("poof");
    if (!this.isHovered) {
      this.timeout -= 0.100;
      if (this.timeout <= 0) {
        clearInterval(this.intervalId);
        if (this.toastEl && this.toastEl.parentNode === this.parent) {
          this.parent.removeChild(this.toastEl);
          delete FBToast.everyMessage[this.message];
        }
      }
    }
  };

  run = () => {

    /**
     * Append children.
     */
    this.parent.appendChild(this.toastEl);
    // TSC Thinks this is a node project :-\
    // tslint:disable-next-line:no-any
    this.intervalId = setInterval(this.doPolling, 100) as any;
  }
}

/**
 * The function responsible for attaching the messages to the container.
 */
export const createToast = (message: string, title: string, color: string) => {

  /**
   * Container element for all of the messages created from init().
   */
  const parent = document.querySelector(".toast-container");
  /**
   * If there's no container created from the init() function, throw an error.
   */
  if (!parent) { throw new Error("toast-container is null."); }

  /**
   * Create elements.
   */
  const t = new FBToast(parent, title, message, color);
  t.run();
};

export const createToastOnce = (message: string,
  title: string,
  color: string,
  fallbackLogger = console.warn) => {
  if (FBToast.everyMessage[message]) {
    fallbackLogger(message);
  } else {
    createToast(message, title, color);
    FBToast.everyMessage[message] = true;
  }
};
