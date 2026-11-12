/**
 * Pin de ubicación del poster de ANDO. Decorativo: la información la lleva el texto.
 * `color` es el relleno del pin y `hole` el centro (debe igualar el fondo donde se apoya).
 */
export default function RoutePin({
  color = '#F2904A',
  hole = '#750031',
  className = '',
}: {
  color?: string;
  hole?: string;
  className?: string;
}) {
  return (
    <svg width="36" height="46" viewBox="0 0 40 52" aria-hidden="true" className={`shrink-0 ${className}`}>
      <ellipse cx="20" cy="46" rx="14" ry="4.5" fill="currentColor" opacity="0.28" />
      <path
        d="M20 2C11.7 2 5 8.5 5 16.6 5 27.5 20 44 20 44s15-16.5 15-27.4C35 8.5 28.3 2 20 2Z"
        fill={color}
      />
      <circle cx="20" cy="16.5" r="6.5" fill={hole} />
    </svg>
  );
}
