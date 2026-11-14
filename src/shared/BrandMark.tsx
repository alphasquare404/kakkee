export function BrandMark() {
  const base = import.meta.env.BASE_URL;

  return (
    <span className="brand-logo">
      <img
        className="brand-wordmark brand-wordmark-dark"
        src={`${base}icons/kakkee-wordmark-white.png`}
        alt=""
        width={1185}
        height={360}
      />
      <img
        className="brand-wordmark brand-wordmark-light"
        src={`${base}icons/kakkee-wordmark-black.png`}
        alt=""
        width={1184}
        height={360}
      />
      <img
        className="brand-mark"
        src={`${base}icons/icon-192.png`}
        alt=""
        width={30}
        height={30}
      />
    </span>
  );
}
