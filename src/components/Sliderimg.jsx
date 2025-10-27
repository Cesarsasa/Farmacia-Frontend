import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Flecha personalizada derecha
function NextArrow(props) {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} !right-4 !z-10`}
      onClick={onClick}
    >
      ➡️
    </div>
  );
}

// Flecha personalizada izquierda
function PrevArrow(props) {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} !left-4 !z-10`}
      onClick={onClick}
    >
      ⬅️
    </div>
  );
}

export default function ImageSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />
  };

  const images = [
    "https://farmaciaseconomicas.com.gt/wp-content/uploads/2025/10/Xtremdoz.jpg",
    "https://farmaciaseconomicas.com.gt/wp-content/uploads/2025/09/Servicios-gratis.jpg",
    "https://farmaciaseconomicas.com.gt/wp-content/uploads/2025/09/Vitaminas-en-gomita.jpg"
  ]

  return (
    <div className="mt-20">
      <Slider {...settings}>
        {images.map((src, i) => (
          <div key={i}>
            <img
              src={src}
              alt={`slide-${i}`}
              className="w-full h-[500px] object-cover"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

