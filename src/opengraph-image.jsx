import { ImageResponse } from "next/og";

export const alt = "Kick The Market";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-black">
        <h1 tw="text-6xl text-center p-8 text-orange-600">Kick The Market</h1>
        {/* comment previous line when logo is ready */}
         <img
            alt="Kick The Market"
            src="https://kickthemarket.vercel.app/opengraph-image.png"
            width={600}
            height={400}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 10
            }}
            tw="absolute top-0 left-0 w-full h-full z-10"
          />
      </div>
    ),
    {
      ...size,
    }
  );
}
