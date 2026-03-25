export const GUIDES = [
  {
    slug: "comfyui-beginners-guide",
    title: "ComfyUI 초보자 가이드: 설치부터 첫 이미지 생성까지",
    description: "ComfyUI를 처음 시작하는 분들을 위한 완벽 가이드. 설치, 기본 개념, 첫 이미지 생성까지 단계별로 안내합니다.",
    category: "입문",
    date: "2026-03-15",
    sections: [
      {
        heading: "ComfyUI란 무엇인가요?",
        content: `ComfyUI는 Stable Diffusion 기반의 AI 이미지 생성을 위한 노드 기반 인터페이스입니다. 기존의 Automatic1111 WebUI와 달리, 각 처리 단계를 노드로 시각적으로 연결하여 워크플로우를 구성합니다.

이 방식의 장점은 다음과 같습니다:
• 이미지 생성 과정을 세밀하게 제어할 수 있습니다
• 복잡한 워크플로우를 저장하고 공유할 수 있습니다
• 다양한 모델과 기법을 자유롭게 조합할 수 있습니다
• 커스텀 노드를 통해 기능을 확장할 수 있습니다
• VRAM 사용량을 최적화할 수 있습니다`
      },
      {
        heading: "시스템 요구사항",
        content: `ComfyUI를 실행하려면 다음 사양이 필요합니다:

• OS: Windows 10/11, macOS, Linux
• GPU: NVIDIA GTX 1060 이상 (최소 VRAM 4GB, 권장 8GB 이상)
• RAM: 8GB 이상 (권장 16GB)
• 저장공간: 최소 20GB (모델 포함 시 50GB 이상 권장)
• Python 3.10 이상
• Git

AMD GPU를 사용하는 경우 DirectML 백엔드를 통해 사용할 수 있지만, NVIDIA GPU에 비해 성능이 다소 떨어질 수 있습니다. Apple Silicon(M1/M2/M3) Mac은 MPS 백엔드를 통해 지원됩니다.`
      },
      {
        heading: "설치 방법",
        content: `ComfyUI 설치는 두 가지 방법이 있습니다:

방법 1: ComfyUI Studio 원클릭 설치 (추천)
ComfyUI Studio의 Install 탭에서 원클릭 설치 스크립트를 다운로드하세요. Python, Git, ComfyUI, 기본 모델까지 자동으로 설치됩니다.

방법 2: 수동 설치
1. Python 3.10+ 설치
2. Git 설치
3. 터미널에서 실행: git clone https://github.com/comfyanonymous/ComfyUI.git
4. ComfyUI 폴더로 이동 후 의존성 설치
5. ComfyUI 실행

설치가 완료되면 브라우저에서 http://127.0.0.1:8188에 접속하여 ComfyUI를 사용할 수 있습니다.`
      },
      {
        heading: "기본 워크플로우 이해하기",
        content: `ComfyUI의 기본 워크플로우는 다음 노드들로 구성됩니다:

1. Checkpoint Loader: AI 모델을 불러옵니다
2. CLIP Text Encode: 텍스트 프롬프트를 AI가 이해할 수 있는 형태로 변환합니다
3. KSampler: 실제 이미지를 생성하는 핵심 노드입니다
4. VAE Decode: 생성된 데이터를 실제 이미지로 변환합니다
5. Save Image: 최종 이미지를 저장합니다

이 노드들을 순서대로 연결하면 가장 기본적인 이미지 생성 워크플로우가 완성됩니다. ComfyUI Studio를 사용하면 이러한 워크플로우를 자동으로 생성할 수 있어 초보자도 쉽게 시작할 수 있습니다.`
      },
      {
        heading: "첫 이미지 생성하기",
        content: `ComfyUI Studio를 활용하면 훨씬 쉽게 첫 이미지를 생성할 수 있습니다:

1. ComfyUI Studio에서 \"매뉴얼\" 모드를 선택합니다
2. 원하는 카테고리를 선택합니다 (예: 인물 사진)
3. 해상도, 샘플러, 모델 등을 설정합니다
4. \"생성\" 버튼을 클릭하면 워크플로우 JSON이 생성됩니다
5. 생성된 JSON을 복사합니다
6. ComfyUI에서 Ctrl+V로 붙여넣기 하면 워크플로우가 자동으로 구성됩니다
7. Queue Prompt 버튼을 클릭하여 이미지를 생성하세요

팁: VRAM이 부족하다면 ComfyUI Studio에서 VRAM 설정을 낮춰주세요. 자동으로 VRAM에 최적화된 워크플로우를 생성해줍니다.`
      }
    ]
  },
  {
    slug: "comfyui-workflow-guide",
    title: "ComfyUI 워크플로우 완벽 가이드",
    description: "노드 구성부터 고급 기법까지, ComfyUI 워크플로우의 모든 것을 알아봅니다.",
    category: "워크플로우",
    date: "2026-03-15",
    sections: [
      {
        heading: "워크플로우의 기본 구조",
        content: `ComfyUI 워크플로우는 노드(Node)와 연결(Connection)으로 구성됩니다. 각 노드는 특정 기능을 수행하며, 노드 간의 연결을 통해 데이터가 흐릅니다.

주요 데이터 타입:
• MODEL: AI 모델 데이터
• CLIP: 텍스트 인코더
• VAE: 이미지 인코더/디코더
• CONDITIONING: 프롬프트 조건
• LATENT: 잠재 공간 이미지
• IMAGE: 실제 이미지 픽셀 데이터

각 데이터 타입은 색상으로 구분되며, 같은 타입의 출력과 입력만 연결할 수 있습니다.`
      },
      {
        heading: "Text-to-Image 워크플로우",
        content: `가장 기본적인 워크플로우입니다. 텍스트 프롬프트를 입력하면 이미지를 생성합니다.

필요한 노드:
• Load Checkpoint: 모델 로드
• CLIP Text Encode (양성): 원하는 이미지 설명 (positive prompt)
• CLIP Text Encode (음성): 원하지 않는 요소 (negative prompt)
• Empty Latent Image: 출력 이미지 크기 설정
• KSampler: 이미지 생성 (스텝, 샘플러, CFG 설정)
• VAE Decode: 잠재 공간에서 이미지로 변환
• Save Image: 최종 결과 저장

ComfyUI Studio에서 \"매뉴얼\" 모드로 이 워크플로우를 자동으로 생성할 수 있습니다.`
      },
      {
        heading: "Image-to-Image 워크플로우",
        content: `기존 이미지를 기반으로 새로운 이미지를 생성하는 워크플로우입니다.

Text-to-Image와의 차이점:
• Empty Latent Image 대신 Load Image + VAE Encode 사용
• denoise 값으로 원본 이미지 반영률 조절 (0.3~0.7 권장)
• denoise가 낮을수록 원본에 가깝고, 높을수록 새로운 이미지에 가깝습니다

활용 예시:
• 스케치를 완성된 그림으로 변환
• 사진의 스타일 변경
• 저해상도 이미지 품질 개선`
      },
      {
        heading: "ControlNet 활용",
        content: `ControlNet은 이미지 생성을 더욱 정밀하게 제어할 수 있게 해주는 기술입니다.

주요 ControlNet 유형:
• Canny: 윤곽선을 기반으로 구도 제어
• Depth: 깊이 정보를 활용한 3D 구조 유지
• OpenPose: 인체 포즈 제어
• Scribble: 간단한 스케치로 이미지 생성
• Tile: 이미지 업스케일 및 디테일 추가

ControlNet을 사용하려면 Apply ControlNet 노드를 추가하고, ControlNet 모델과 참조 이미지를 연결하면 됩니다. ComfyUI Studio에서는 ControlNet 카테고리를 선택하면 자동으로 구성됩니다.`
      },
      {
        heading: "워크플로우 최적화 팁",
        content: `워크플로우 성능을 최적화하는 팁입니다:

VRAM 절약:
• fp16 모드로 모델 로드 (메모리 절반 사용)
• VAE tiling 활성화 (고해상도 이미지 처리 시)
• 불필요한 노드 제거
• Checkpoint 모델 대신 경량 모델 사용

품질 향상:
• CFG Scale 7~12 사이로 설정
• Steps 20~30 사이로 설정 (더 많아도 품질 향상 미미)
• 스케일 업스케일러 사용 (2배 확대)
• Negative prompt에 품질 저하 요소 명시

ComfyUI Studio는 VRAM 설정에 따라 자동으로 최적화된 워크플로우를 생성해주므로, 초보자도 최적의 성능을 얻을 수 있습니다.`
      }
    ]
  },
  {
    slug: "comfyui-model-guide",
    title: "ComfyUI 모델 설치 및 추천 가이드",
    description: "체크포인트, LoRA, ControlNet 등 다양한 모델의 설치 방법과 추천 모델을 안내합니다.",
    category: "모델",
    date: "2026-03-15",
    sections: [
      {
        heading: "AI 모델의 종류",
        content: `ComfyUI에서 사용하는 주요 모델 유형을 알아보겠습니다.

1. 체크포인트 (Checkpoint)
가장 기본이 되는 모델입니다. 이미지 생성의 기반이 되며, 파일 크기는 보통 2~7GB입니다.
• SD 1.5 계열: 가벼우며 빠르지만 품질이 제한적
• SDXL 계열: 고품질이지만 더 많은 VRAM 필요
• SD 3.5 계열: 최신 모델, 텍스트 이해력 향상
• Flux 계열: Black Forest Labs의 최신 모델, 높은 품질

2. LoRA (Low-Rank Adaptation)
특정 스타일이나 컨셉을 학습한 소형 모델입니다. 체크포인트와 함께 사용하며, 파일 크기는 10~300MB 정도입니다.

3. ControlNet
이미지 생성을 제어하는 모델입니다. 포즈, 윤곽, 깊이 등을 기반으로 구도를 제어합니다.

4. 업스케일러 (Upscaler)
생성된 이미지의 해상도를 높여주는 모델입니다.`
      },
      {
        heading: "모델 설치 방법",
        content: `ComfyUI에 모델을 설치하는 방법은 간단합니다.

1. 모델 다운로드
• Civitai (civitai.com): 가장 많은 모델이 공유되는 플랫폼
• Hugging Face (huggingface.co): 공식 모델과 연구용 모델

2. 모델 파일 배치
다운로드한 모델 파일을 ComfyUI의 해당 폴더에 복사합니다:
• 체크포인트: models/checkpoints/
• LoRA: models/loras/
• ControlNet: models/controlnet/
• VAE: models/vae/
• 업스케일러: models/upscale_models/

3. ComfyUI 재시작
모델 파일을 배치한 후 ComfyUI를 재시작하면 자동으로 인식됩니다.`
      },
      {
        heading: "추천 체크포인트 모델",
        content: `VRAM별 추천 모델입니다:

4GB VRAM (저사양):
• Dreamshaper v8 (SD 1.5) - 범용 모델, 빠르고 가벼움
• Realistic Vision v6 (SD 1.5) - 사실적인 인물/풍경

6~8GB VRAM (중간):
• Juggernaut XL v9 (SDXL) - 고품질 범용 모델
• RealVisXL v4 (SDXL) - 사실적인 이미지

12GB+ VRAM (고사양):
• Flux.1 Dev - 최신 고품질 모델
• SD 3.5 Large - 텍스트 이해력 우수

ComfyUI Studio의 Models 탭에서 VRAM에 맞는 모델을 추천받을 수 있습니다.`
      },
      {
        heading: "LoRA 활용법",
        content: `LoRA는 체크폼인트에 특정 스타일이나 컨셉을 추가하는 소형 모델입니다.

사용 방법:
1. LoRA 파일을 models/loras/ 폴더에 배치
2. ComfyUI에서 Load LoRA 노드 추가
3. 체크포인트 로더와 연결
4. strength_model과 strength_clip 값 조절 (0.5~1.0 권장)

인기 LoRA 카테고리:
• 스타일 LoRA: 애니메이션, 수채화, 픽셀아트 등
• 컨셉 LoRA: 특정 캐릭터, 의상, 포즈
• 품질 LoRA: 디테일 향상, 선명도 개선
• 효과 LoRA: 조명, 보케, 배경 효과

주의사항:
• LoRA는 호환되는 체크포인트와 함께 사용해야 합니다 (SD 1.5용 LoRA는 SDXL에 사용 불가)
• 여러 LoRA를 동시에 사용할 수 있지만, 각 strength를 낮춰야 합니다
• trigger word가 있는 LoRA는 프롬프트에 해당 키워드를 포함해야 합니다`
      },
      {
        heading: "모델 관리 팁",
        content: `모델이 많아지면 관리가 중요해집니다.

폴더 구조화:
• checkpoints/ 아래에 용도별 하위 폴더 생성 (realistic/, anime/, artistic/)
• loras/ 아래에도 카테고리별 분류

저장공간 관리:
• 사용하지 않는 모델은 별도 폴더로 이동
• 같은 모델의 여러 버전은 최신만 유지
• fp16 버전이 있다면 fp32 대신 사용 (용량 절반)

ComfyUI Studio Tip:
ComfyUI Studio의 Models 탭에서 모델을 탐색하고, 워크플로우에 자동으로 적용할 수 있습니다. VRAM에 맞는 모델만 필터링하여 추천해주므로 호환성 문제를 예방할 수 있습니다.`
      }
    ]
  },
  {
    slug: "comfyui-vs-a1111",
    title: "ComfyUI vs Automatic1111 WebUI: 완벽 비교 가이드",
    description: "두 가지 대표적인 Stable Diffusion UI의 장단점과 사용 시나리오를 비교합니다.",
    category: "비교",
    date: "2026-03-18",
    sections: [
      {
        heading: "ComfyUI와 A1111 WebUI란?",
        content: `Stable Diffusion을 사용하기 위한 대표적인 두 가지 인터페이스가 있습니다.

Automatic1111 WebUI (A1111):
• 웹 브라우저 기반의 직관적인 UI
• 탭 방식으로 txt2img, img2img, Extras 등을 구분
• 초보자에게 친숨한 인터페이스
• 많은 확장 기능(Extensions) 지원

ComfyUI:
• 노드 기반 워크플로우 에디터
• 각 처리 단계를 노드로 시각적으로 연결
• 고급 사용자에게 적합한 세밀한 제어
• 워크플로우 저장/공유/재사용 가능`
      },
      {
        heading: "주요 차이점 비교",
        content: `사용성:
• A1111: 버튼 클릭만으로 바로 이미지 생성 가능. 직관적인 설정 패널
• ComfyUI: 노드를 연결해야 하므로 학습 곡선이 있음. ComfyUI Studio가 이 걍을 해소

성능:
• A1111: 표준적인 성능, 최적화 옵션 제한적
• ComfyUI: VRAM 최적화 우수, 같은 GPU에서 더 높은 해상도 가능

유연성:
• A1111: 정해진 파이프라인만 사용 가능
• ComfyUI: 자유로운 파이프라인 구성, 커스텀 노드 제작 가능

최신 모델 지원:
• A1111: 새 모델 지원에 시간이 걸림
• ComfyUI: Flux, SD3.5, Wan 2.2 등 최신 모델 빠르게 지원`
      },
      {
        heading: "어떤 것을 선택해야 할까?",
        content: `A1111을 추천하는 경우:
• AI 이미지 생성을 처음 시작하는 초보자
• 복잡한 워크플로우 없이 간단하게 사용하고 싶은 분
• 확장 기능(Extensions) 생태계를 활용하고 싶은 분

ComfyUI를 추천하는 경우:
• 이미지 생성 과정을 세밀하게 제어하고 싶은 분
• VRAM이 제한적인 환경에서 최대 성능을 끄어내고 싶은 분
• 워크플로우를 저장하고 공유하고 싶은 분
• Flux, Wan 등 최신 모델을 사용하고 싶은 분
• ComfyUI Studio를 활용하면 초보자도 쉽게 사용 가능`
      }
    ]
  },
  {
    slug: "controlnet-complete-guide",
    title: "ControlNet 완벽 가이드: 유형별 활용법",
    description: "Canny, Depth, OpenPose, Scribble 등 ControlNet의 모든 유형과 활용 방법을 상세히 안내합니다.",
    category: "ControlNet",
    date: "2026-03-18",
    sections: [
      {
        heading: "ControlNet이란?",
        content: `ControlNet은 이미지 생성 과정에서 구도를 정밀하게 제어할 수 있게 해주는 기술입니다. 참조 이미지의 특정 정보(윤곽선, 깊이, 포즈 등)를 추출하여 생성 결과에 반영합니다.

활용 예시:
• 건축물의 윤곽을 유지하면서 스타일만 변경
• 인물의 포즈를 정확히 지정
• 간단한 스케치를 완성된 작품으로 변환
• 저해상도 이미지를 고품질로 업스케일`
      },
      {
        heading: "ControlNet 유형별 상세 설명",
        content: `1. Canny (윤곽선 검출)
이미지의 윤곽선을 추출하여 구도를 제어합니다. 건축물, 제품 디자인, 코믹스 선화 작업에 효과적입니다.

2. Depth (깊이 맵)
3D 공간의 깊이 정보를 활용합니다. 실내 공간, 풍경, 건축 시각화에 적합합니다.

3. OpenPose (인체 포즈)
인체의 관절 위치를 감지하여 포즈를 제어합니다. 캐릭터 일러스트, 패션 사진에 활용됩니다.

4. Scribble (스케치)
간단한 손그림을 기반으로 이미지를 생성합니다. 아이디어 스케치부터 출발하는 창작 작업에 적합합니다.

5. Tile (타일)
이미지를 타일 단위로 처리하여 업스케일하거나 디테일을 추가합니다. 고해상도 이미지 생성에 필수적입니다.`
      },
      {
        heading: "ControlNet 설정 팁",
        content: `strength (강도) 설정:
• 0.3~0.5: 약한 제어, 창의적인 결과
• 0.6~0.8: 적당한 제어, 가장 많이 사용
• 0.9~1.0: 강한 제어, 참조 이미지에 충실

복수 ControlNet 사용:
• Canny + Depth를 함께 사용하면 형태와 공간감을 모두 제어 가능
• 각 ControlNet의 strength를 낮춰서 사용 (0.4~0.6)

ComfyUI Studio에서는 ControlNet 카테고리를 선택하면 자동으로 최적의 설정이 적용된 워크플로우가 생성됩니다.`
      }
    ]
  },
  {
    slug: "lora-usage-guide",
    title: "LoRA 사용법과 추천: 스타일을 자유롭게 적용하기",
    description: "LoRA의 개념부터 설치, 추천 모델, 고급 활용법까지 상세히 안내합니다.",
    category: "LoRA",
    date: "2026-03-18",
    sections: [
      {
        heading: "LoRA란 무엇인가?",
        content: `LoRA(Low-Rank Adaptation)는 기본 모델에 특정 스타일이나 컨셉을 추가하는 소형 모델입니다. 체크포인트가 기본 화풍이라면, LoRA는 특수 붓과 물감 같은 것입니다.

특징:
• 파일 크기: 10~300MB (체크포인트의 1/20 수준)
• 여러 개를 동시에 적용 가능
• 특정 체크포인트와 호환되어야 함
• strength로 영향력 조절 가능`
      },
      {
        heading: "인기 LoRA 카테고리별 추천",
        content: `스타일 LoRA:
• Add Detail XL: 디테일 강화, 피부 텍스처 선명화
• Anime Lineart: 애니메이션 선화 스타일
• Watercolor: 수채화 화풍 적용
• Pixel Art: 레트로 픽셀 아트 스타일

컨셉 LoRA:
• 특정 캐릭터 LoRA: 원하는 캐릭터를 일관되게 생성
• 의상 LoRA: 특정 의복, 액세서리 적용
• 배경 LoRA: 특정 환경이나 장소 적용

품질 LoRA:
• Detail Enhancer: 전체적인 디테일 향상
• Face Fix: 얼굴 품질 개선
• Hand Fix: 손 표현 개선`
      },
      {
        heading: "LoRA 적용 팁",
        content: `strength 설정 가이드:
• 0.3~0.5: 약한 적용, 자연스러운 효과
• 0.6~0.8: 권장 범위, 몬렬한 효과
• 0.9~1.0: 강한 적용, 과도할 수 있음

복수 LoRA 사용 시:
• 전체 strength 합계가 1.5를 넘지 않도록 조절
• 스타일 LoRA + 품질 LoRA 조합이 효과적
• 같은 유형의 LoRA는 충돌할 수 있으므로 주의

ComfyUI Studio에서 LoRA 카테고리를 선택하면 LoRA 로더 노드가 포함된 워크플로우가 자동 생성됩니다.`
      }
    ]
  },
  {
    slug: "vram-optimization-guide",
    title: "VRAM 최적화 가이드: 저사양 GPU에서 최대 성능 끄어내기",
    description: "4~8GB VRAM 환경에서 ComfyUI를 최적화하는 방법을 상세히 안내합니다.",
    category: "최적화",
    date: "2026-03-17",
    sections: [
      {
        heading: "VRAM이란?",
        content: `VRAM(Video RAM)은 GPU의 전용 메모리입니다. AI 이미지 생성에서 가장 중요한 하드웨어 요소입니다.

VRAM 사용량에 영향을 주는 요소:
• 모델 크기: SD 1.5(~4GB) vs SDXL(~7GB) vs Flux(~14GB)
• 이미지 해상도: 해상도가 높을수록 더 많은 VRAM 필요
• 배치 크기: 여러 장을 동시 생성하면 VRAM 배로 증가
• ControlNet, LoRA 등 추가 모델`
      },
      {
        heading: "VRAM 절약 테크닉",
        content: `1. FP16/FP8 모드 사용
• FP32 대신 FP16 사용 시 VRAM 50% 절약
• FP8 사용 시 추가 25% 절약 (품질 저하 미미)

2. VAE Tiling 활성화
• 고해상도 이미지 처리 시 필수
• 이미지를 타일 단위로 분할 처리하여 VRAM 절약

3. GGUF 모델 사용
• 양자화된 모델로 VRAM 30~40% 절약
• Q4, Q5, Q8 등 다양한 양자화 수준 선택 가능

4. Weight Streaming
• 모델 가중치를 RAM으로 오프로드
• VRAM이 부족할 때 자동으로 활성화

5. 적절한 해상도 선택
• SD 1.5: 512x512 권장
• SDXL: 1024x1024 권장
• 필요시 작게 생성 후 업스케일`
      },
      {
        heading: "VRAM별 추천 설정",
        content: `4GB VRAM (GTX 1060, RTX 3050):
• SD 1.5 모델만 사용
• 512x512 해상도, 배치 1
• FP16 필수, GGUF 권장

6GB VRAM (RTX 2060, RTX 3060):
• SD 1.5 원활, SDXL은 FP8로 가능
• 768x768까지 가능

8GB VRAM (RTX 3070, RTX 4060):
• SDXL 원활
• 1024x1024 가능
• ControlNet 동시 사용 가능

ComfyUI Studio에서 VRAM을 설정하면 자동으로 최적화된 워크플로우를 생성해줍니다.`
      }
    ]
  },
  {
    slug: "flux-model-guide",
    title: "Flux 모델 사용법: 차세대 AI 이미지 생성",
    description: "Black Forest Labs의 Flux 모델의 특징, 설치 방법, 최적 설정을 안내합니다.",
    category: "모델",
    date: "2026-03-17",
    sections: [
      {
        heading: "Flux 모델이란?",
        content: `Flux는 Black Forest Labs에서 개발한 차세대 이미지 생성 모델입니다. Stable Diffusion의 핵심 개발자들이 만들어 기술적으로 많은 발전이 있습니다.

주요 특징:
• 우수한 텍스트 이해력: 복잡한 프롬프트도 정확하게 반영
• 높은 이미지 품질: SDXL 대비 더욱 선명하고 자연스러운 결과
• 다양한 화풍: 사실적, 예술적, 애니메이션 등 다양한 스타일 소화

버전:
• Flux.1 Dev: 개발자용 오픈소스 버전 (추천)
• Flux.1 Schnell: 빠른 생성 버전 (품질 약간 낮음)
• Flux.1 Pro: 상업용 API 버전`
      },
      {
        heading: "Flux 최적 설정",
        content: `권장 설정:
• Steps: 20~28 (Schnell은 4도 가능)
• CFG: 3.0~4.5 (낮은 CFG가 특징)
• Sampler: dpmpp_2m, euler
• Scheduler: sgm_uniform
• 해상도: 1024x1024, 832x1216, 1216x832

VRAM 요구사항:
• 최소 12GB VRAM 필요
• FP8로 8GB에서 가능하지만 느림
• GGUF Q4 버전으로 6GB에서 가능`
      },
      {
        heading: "Flux와 SDXL 비교",
        content: `품질:
• Flux: 더 선명하고 자연스러운 결과, 텍스트 반영력 우수
• SDXL: 충분히 좋지만 Flux보다 약간 부자연스러울 수 있음

속도:
• Flux: SDXL보다 느림, 더 많은 VRAM 필요
• SDXL: 빠르고 VRAM 효율적

생태계:
• Flux: LoRA 생태계가 빠르게 성장 중
• SDXL: 성숙한 LoRA/ControlNet 생태계

ComfyUI Studio에서 Flux 모델을 선택하면 자동으로 Flux에 최적화된 워크플로우가 생성됩니다.`
      }
    ]
  },
  {
    slug: "comfyui-video-guide",
    title: "ComfyUI 비디오 생성 가이드: Text-to-Video & Image-to-Video",
    description: "Wan 2.2, HunyuanVideo, LTX-Video 모델로 AI 비디오를 생성하는 방법을 안내합니다.",
    category: "비디오",
    date: "2026-03-17",
    sections: [
      {
        heading: "AI 비디오 생성이란?",
        content: `AI 비디오 생성은 텍스트 또는 이미지로부터 짧은 비디오 클립을 만드는 기술입니다.

두 가지 방식:
• Text-to-Video (T2V): 텍스트 설명으로 비디오 생성
• Image-to-Video (I2V): 정지 이미지를 비디오로 변환

주요 모델:
• Wan 2.2: 오픈소스 T2V 최강, 프롬프트 충실도 높음
• HunyuanVideo: Tencent의 I2V 모델, 자연스러운 움직임
• LTX-Video 2.3: NVIDIA 최적화, 빠른 생성 속도`
      },
      {
        heading: "비디오 생성 설정",
        content: `T2V 권장 설정:
• 해상도: 480p (832x480) 또는 720p (1280x720)
• 프레임: 24~48 프레임 (1~2초)
• Steps: 25~35
• CFG: 5~7
• Sampler: euler

I2V 권장 설정:
• denoise: 0.7~0.85 (원본 이미지 유지도)
• Steps: 30~40
• CFG: 5~6

VRAM 요구사항:
• Wan 2.2: 최소 16GB VRAM
• HunyuanVideo: 최소 24GB VRAM
• LTX-Video: 최소 12GB VRAM`
      },
      {
        heading: "비디오 품질 향상 팁",
        content: `프롬프트 작성 팁:
• 움직임을 구체적으로 설명 (예: "gentle zoom in", "slow pan left")
• 시간적 변화를 명시 (예: "sunrise to sunset transition")
• 카메라 움직임 키워드 활용

품질 개선:
• 낮은 해상도로 생성 후 업스케일
• TeaCache로 3배 속도 향상 (품질 유지)
• Negative prompt에 "static, flickering, jumpy" 추가
• 프레임 보간으로 부드러운 움직임 효과

ComfyUI Studio에서 T2V 또는 I2V 카테고리를 선택하면 자동으로 최적화된 비디오 워크플로우가 생성됩니다.`
      }
    ]
  },
  {
    slug: "comfyui-custom-nodes",
    title: "ComfyUI 커스텀 노드 추천: 필수 설치 목록",
    description: "작업 효율을 높여주는 필수 커스텀 노드 팩을 소개하고 설치 방법을 안내합니다.",
    category: "커스텀 노드",
    date: "2026-03-16",
    sections: [
      {
        heading: "커스텀 노드란?",
        content: `ComfyUI의 커스텀 노드는 기본 노드에 없는 추가 기능을 제공하는 확장 패키지입니다. 커뮤니티에서 개발되며, ComfyUI Manager를 통해 쉽게 설치할 수 있습니다.

설치 방법:
1. ComfyUI Manager 설치 (필수)
2. Manager 메뉴에서 원하는 노드 팩 검색
3. Install 버튼 클릭
4. ComfyUI 재시작`
      },
      {
        heading: "필수 커스텀 노드 팩 TOP 10",
        content: `1. ComfyUI Manager
• 커스텀 노드 관리의 핵심. 모든 노드를 검색/설치/업데이트 가능

2. ComfyUI Impact Pack
• 얼굴 감지, 세부 복원, 자동 인페인팅 등 핵심 기능

3. ComfyUI ControlNet Auxiliary
• ControlNet 전처리기 모음 (Canny, Depth, OpenPose 등)

4. Efficiency Nodes
• 워크플로우 간소화. KSampler+VAE+Save 통합

5. WAS Node Suite
• 이미지 처리, 텍스트 처리, 수학 연산 등 다양한 유틸리티

6. ComfyUI Essentials
• 마스크 처리, 이미지 변환, 배치 처리 등 필수 도구

7. rgthree Nodes
• 워크플로우 정리, 노드 그룹화, 디버깅 도구

8. ComfyUI AnimateDiff
• 이미지를 GIF/비디오 애니메이션으로 변환

9. ComfyUI IPAdapter Plus
• 참조 이미지의 스타일을 새 이미지에 적용

10. ComfyUI KJNodes
• 문자열 처리, 조건 분기, 루프 등 고급 워크플로우 도구`
      },
      {
        heading: "커스텀 노드 관리 팁",
        content: `업데이트:
• ComfyUI Manager에서 주기적으로 업데이트 확인
• 주요 업데이트 전에 워크플로우 백업

충돌 해결:
• 여러 노드 팩이 같은 이름의 노드를 제공하면 충돌 발생
• ComfyUI Manager의 "Fix" 기능으로 자동 해결

성능:
• 사용하지 않는 노드 팩은 비활성화하여 로딩 시간 단축
• 필요한 노드 팩만 선별적으로 설치

ComfyUI Studio의 노드 레퍼런스 탭에서 각 노드의 상세 정보와 사용법을 확인할 수 있습니다.`
      }
    ]
  },
  {
    slug: "comfyui-prompt-engineering",
    title: "프롬프트 엔지니어링 가이드: AI 이미지 품질을 높이는 방법",
    description: "Stable Diffusion/Flux에서 효과적인 프롬프트 작성법과 팁을 상세히 안내합니다.",
    category: "프롬프트",
    date: "2026-03-16",
    sections: [
      {
        heading: "프롬프트의 기본 구조",
        content: `효과적인 프롬프트는 다음 요소로 구성됩니다:

1. 주제 (Subject): 무엇을 그릴지
• 예: "a young woman", "mountain landscape", "cute cat"

2. 스타일 (Style): 어떤 화풍으로
• 예: "oil painting", "anime style", "photorealistic", "watercolor"

3. 품질 (Quality): 어떤 품질로
• 예: "masterpiece", "best quality", "8k", "highly detailed"

4. 조명/분위기 (Lighting/Mood): 어떤 분위기로
• 예: "golden hour", "dramatic lighting", "soft ambient light"

5. 구도 (Composition): 어떤 구도로
• 예: "close-up", "wide angle", "bird's eye view"`
      },
      {
        heading: "모델별 프롬프트 전략",
        content: `SD 1.5 / SDXL:
• 품질 키워드가 중요: "masterpiece, best quality, highly detailed"
• Negative prompt 활용: "worst quality, low quality, ugly, deformed"
• 가중치 구문 사용: "(keyword:1.3)" 으로 강조

Flux:
• 자연어에 가까운 설명이 효과적
• 품질 키워드보다 구체적 설명이 중요
• 복잡한 장면도 정확하게 이해
• Negative prompt 의존도 낮음

Pony Diffusion:
• score_9, score_8_up 품질 태그 사용
• 애니메이션 특화 키워드 활용`
      },
      {
        heading: "Negative Prompt 활용법",
        content: `Negative prompt는 원하지 않는 요소를 명시하여 품질을 높입니다.

기본 Negative prompt:
• "worst quality, low quality, ugly, deformed, blurry, noisy"

인물 사진용:
• "deformed face, extra fingers, mutated hands, bad anatomy, bad proportions"

풍경용:
• "oversaturated, overexposed, underexposed, cropped, watermark"

애니메이션용:
• "3d, realistic, photo, bad anatomy, extra limbs"

ComfyUI Studio의 프롬프트 빌더 모드를 활용하면 AI가 최적의 프롬프트를 자동으로 생성해줍니다.`
      }
    ]
  }
];
