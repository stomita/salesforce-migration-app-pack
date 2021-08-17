import React, { MouseEvent, ReactNode } from "react";
import { useSLDSConfig } from "../hooks/slds";

/* --------------------------------------------------------------------------------- */
export type ButtonIconProps = {
  icon: string;
  category?: string;
  size?: string;
  title?: string;
};

export const ButtonIcon: React.FC<ButtonIconProps> = (props) => {
  const { icon, category = "utility", size = "medium", title } = props;
  const { assetRoot } = useSLDSConfig();
  return (
    <>
      <svg
        className={`slds-button__icon slds-button__icon_${size}`}
        aria-hidden="true"
      >
        <use
          xlinkHref={`${assetRoot}/assets/icons/${category}-sprite/svg/symbols.svg#${icon}`}
        ></use>
      </svg>
      {title ? <span className="slds-assistive-text">{title}</span> : undefined}
    </>
  );
};

/* --------------------------------------------------------------------------------- */
export type ButtonProps = {
  className?: string;
  type?: string;
  icon?: string;
  iconCategory?: string;
  iconSize?: string;
  iconInverse?: boolean;
  title?: string;
  onClick?: () => void;
};

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    className = "",
    type = "neutral",
    icon,
    iconCategory,
    iconSize,
    title,
    children,
    onClick,
  } = props;
  return (
    <button
      className={`slds-button ${
        icon ? "slds-button_icon" : ""
      } slds-button_${type} ${className}`}
      title={title}
      onClick={onClick}
    >
      {icon ? (
        <ButtonIcon
          icon={icon}
          size={iconSize}
          category={iconCategory}
          title={title}
        />
      ) : undefined}
      {children}
    </button>
  );
};

/* --------------------------------------------------------------------------------- */
export type ToastProps = {
  type?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onClose?: () => void;
};

export const Toast: React.FC<ToastProps> = (props) => {
  const { type, children, onClick, onClose } = props;
  return (
    <div className="slds-notify_container slds-is-relative">
      <div
        className={`slds-notify slds-notify_toast slds-theme_${type}`}
        role="status"
        onClick={onClick}
      >
        <div className="slds-notify__content">{children}</div>
        <div className="slds-notify__close">
          <Button
            type="icon-inverse"
            icon="close"
            title="Close"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------------- */
export type SpinnerProps = {
  size?: string;
};

export const Spinner: React.FC<SpinnerProps> = (props) => {
  const { size = "medium" } = props;
  return (
    <div className="slds-spinner_container">
      <div role="status" className={`slds-spinner slds-spinner_${size}`}>
        <span className="slds-assistive-text">Loading</span>
        <div className="slds-spinner__dot-a"></div>
        <div className="slds-spinner__dot-b"></div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------------- */
type CardProps = {
  title?: string;
  footer?: ReactNode;
};

export const Card: React.FC<CardProps> = ({ title, footer, children }) => (
  <article className="slds-card slds-m-around_large">
    <div className="slds-card__header slds-grid">
      <header className="slds-media slds-media_center slds-has-flexi-truncate">
        <div className="slds-media__body">
          <h2 className="slds-card__header-title">
            <span>{title}</span>
          </h2>
        </div>
      </header>
    </div>
    <div className="slds-card__body slds-card__body_inner">{children}</div>
    {footer ? (
      <footer className="slds-card__footer">{footer}</footer>
    ) : undefined}
  </article>
);

/* --------------------------------------------------------------------------------- */
type ModalProps = {
  title?: string;
  footer?: ReactNode;
  onClose?: () => void;
};

export const Modal: React.FC<ModalProps> = ({
  title,
  footer,
  children,
  onClose,
}) => (
  <>
    <section
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      className="slds-modal slds-fade-in-open"
    >
      <div className="slds-modal__container">
        <header className="slds-modal__header">
          <Button
            className="slds-modal__close"
            type="icon-inverse"
            icon="close"
            iconSize="large"
            title="Close"
            onClick={onClose}
          />
          <h2 className="slds-modal__title slds-hyphenate">{title}</h2>
        </header>
        <div className="slds-modal__content slds-p-around_medium">
          {children}
        </div>
        {footer ? (
          <footer className="slds-modal__footer">{footer}</footer>
        ) : undefined}
      </div>
    </section>
    <div className="slds-backdrop slds-backdrop_open"></div>
  </>
);
