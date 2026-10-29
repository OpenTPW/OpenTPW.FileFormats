---
title: Texture (*.wct)
---

> This page is a work in progress.

**Header**

| Size    | Description                              |
| ------- | ---------------------------------------- |
| 1 byte  | Compression type: 0x12: zlib, 0x13: lzss |
| 1 byte  | Alpha-channel flag                       |
| 1 byte  | bit count                                |
| 1 byte  | Version                                  |
| 2 bytes | width                                    |
| 2 bytes | height                                   |
| 2 bytes | Y channel quantization scale             |
| 2 bytes | Cb channel quantization scale            |
| 2 bytes | Cr channel quantization scale            |
| 2 bytes | A channel quantization scale             |
| 4 bytes | block 0 size                             |
| 4 bytes | block 1 size                             |
| 4 bytes | Checksum field                           |

## Decoding Image

1. Get aligned width / height

```cpp
uint32_t GetAlignedSize(uint32_t size)
{
 uint32_t value = (size - 1);
 uint32_t n = 1;
 for (; (value >>= 1) != 0;){
  ++n;
 }
 if (n < 3){
  n = 3;
 }
 return 1 << n;
}
```

2. Calc max size (largest of aligned width / height)
3. Set up quantization values

```cpp
float float8 = 1.0f - ((float)header.YChannelQuantizationScale * -0.5f);
float floatA = 1.0f - ((float)header.CbChannelQuantizationScale * -0.25f);
float floatC = 1.0f - ((float)header.CrChannelQuantizationScale * -0.25f);
float floatE = (float)header.AChannelQuantizationScale + 1.0f;
```

4. Decompress

LZSS:

```pseudocode
result := []
while true:
  isDelta := GetBit( 1 )
  if isDelta:
    literalValue := GetBits( 8 )
    push literalValue to result
  else:
    offset := GetBits( 12 )
    length := GetBits( 7 ) + 1

    if offset == 0:
      break
    for 0..length:
      push result[ current - offset ] to result
```

5. Decode channels using quantization scales
Cb/Cr use size / 2

6. Convert YCbCr values to RGB

## Coefficient layout

The first header byte selects both compression and the order of the row coefficients. Traditional Chinese `TP.exe` `0x58e510` dispatches `0x12` to `0x58ff60` and `0x13` to `0x591dd0`.

- `0x12` uses packed rows: for a row of size `N`, the first `N/2` values are scale coefficients and the next `N/2` are wavelet coefficients.
- `0x13` interleaves scale and wavelet coefficients in each row: scale at `2*i`, wavelet at `2*i+1`.

In either layout, a coefficient is a signed byte unless it is `-128`, in which case the following little-endian signed 16-bit value is used. The inverse column transform uses the top and bottom halves of the intermediate buffer as scale and wavelet coefficients.

The final u32 is a checksum field in the reader.
