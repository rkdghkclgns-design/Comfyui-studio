export const GUIDES = [
  {
    slug: "comfyui-beginners-guide",
    title: "ComfyUI 초보자 가이드: 설치부터 첫 이미지 생성까지",
    description: "ComfyUI를 처음 시작하는 분들을 위한 완벽 가이드. 설치, 기본 개념, 첫 이미지 생성, 자주 만나는 오류 해결까지 단계별로 안내합니다.",
    category: "입문",
    date: "2026-03-15",
    sections: [
      {
        heading: "ComfyUI란 무엇인가요?",
        content: `ComfyUI는 Stable Diffusion 계열 모델로 이미지를 만들기 위한 노드 기반 인터페이스입니다. Automatic1111 WebUI가 "설정값을 입력하는 폼"이라면, ComfyUI는 "처리 과정을 직접 연결하는 배선도"에 가깝습니다.

예를 들어 이미지 한 장을 만드는 과정은 실제로 이런 단계를 거칩니다. 모델을 메모리에 올리고 → 입력한 문장을 숫자 벡터로 바꾸고 → 노이즈에서 시작해 여러 번 반복하며 형태를 잡고 → 그 결과를 사람이 볼 수 있는 픽셀로 변환합니다. 다른 도구는 이 과정을 하나의 버튼 뒤에 감추지만, ComfyUI는 각 단계를 노드로 꺼내 보여줍니다.

그래서 다음과 같은 일이 가능해집니다.
• 특정 단계만 바꿔 실험할 수 있습니다. 예를 들어 샘플러만 교체하고 나머지는 그대로 두는 식입니다.
• 완성한 워크플로우를 JSON 파일 하나로 저장하고 남에게 그대로 전달할 수 있습니다.
• 업스케일, ControlNet, LoRA 같은 기법을 원하는 위치에 끼워 넣을 수 있습니다.
• 필요한 노드만 실행하므로 VRAM이 적은 그래픽카드에서도 돌릴 여지가 생깁니다.

대신 진입 장벽이 있습니다. 첫 화면이 빈 캔버스라 무엇부터 놓아야 할지 막막합니다. 이 가이드는 그 첫 단계를 넘기는 데 초점을 맞춥니다.`
      },
      {
        heading: "시스템 요구사항",
        content: `가장 중요한 것은 그래픽카드의 VRAM입니다. 시스템 RAM이 아니라 GPU에 달린 전용 메모리를 말합니다.

VRAM별로 현실적으로 무엇이 가능한지 정리하면 다음과 같습니다.
• 4GB: SD1.5 모델로 512×512 생성이 가능합니다. 실행 시 저사양 옵션이 필요합니다.
• 6~8GB: SD1.5는 여유롭고, SDXL도 저사양 옵션을 주면 1024×1024가 돌아갑니다.
• 10~12GB: SDXL을 옵션 없이 편하게 쓸 수 있습니다. 대부분의 사용자에게 권장되는 구간입니다.
• 16GB 이상: Flux 계열이나 짧은 영상 생성까지 시도할 수 있습니다.
• 24GB 이상: 대부분의 워크플로우를 제약 없이 돌릴 수 있습니다.

그 밖의 요구사항입니다.
• 운영체제: Windows 10/11, macOS, Linux
• 시스템 RAM: 16GB 권장. 8GB에서도 되지만 모델을 바꿀 때 느려집니다.
• 저장공간: ComfyUI 자체는 몇 GB지만 모델 파일이 큽니다. SD1.5 체크포인트는 2~7GB, SDXL은 6~7GB, Flux는 12~24GB입니다. 여유 있게 100GB를 확보하는 편이 좋습니다.
• Python 3.10 이상, Git

NVIDIA 이외의 환경도 가능합니다. AMD는 Linux에서 ROCm, Windows에서 DirectML을 씁니다. Apple Silicon 맥은 MPS 백엔드로 동작하지만 같은 등급의 NVIDIA 카드보다 느립니다. GPU 없이 CPU만으로도 실행은 되지만, 이미지 한 장에 수 분에서 수십 분이 걸려 실용적이지 않습니다.`
      },
      {
        heading: "설치 방법",
        content: `설치 방법은 크게 셋입니다. 처음이라면 첫 번째나 두 번째를 권합니다.

■ 방법 1: ComfyUI Studio 원클릭 설치 (가장 쉬움)
이 사이트의 설치 탭에서 스크립트를 내려받아 실행하면 Python, Git, ComfyUI, 기본 모델까지 한 번에 준비됩니다. 명령어를 직접 입력할 필요가 없습니다.

■ 방법 2: 공식 포터블 버전 (윈도우 + NVIDIA)
ComfyUI 깃허브 릴리스 페이지에서 포터블 압축 파일을 내려받아 원하는 폴더에 풀면 끝입니다. Python을 따로 설치하지 않아도 됩니다. 압축을 푼 폴더에서 NVIDIA용 실행 파일을 더블클릭하면 서버가 뜹니다.
주의할 점은 압축 해제 위치입니다. 한글이나 공백이 포함된 경로, 그리고 바탕화면이나 다운로드처럼 클라우드 동기화가 걸린 폴더는 피하세요. 예상치 못한 오류의 흔한 원인입니다.

■ 방법 3: 수동 설치 (맥, 리눅스, 또는 직접 관리하고 싶을 때)
터미널에서 순서대로 실행합니다.

  git clone https://github.com/comfyanonymous/ComfyUI.git
  cd ComfyUI
  python -m venv venv

가상환경을 활성화합니다. 윈도우는 venv\\Scripts\\activate, 맥과 리눅스는 source venv/bin/activate 입니다. 이어서 PyTorch를 설치합니다. 이 부분은 환경마다 명령이 다르므로 PyTorch 공식 사이트에서 자신의 환경에 맞는 명령을 확인해 그대로 복사하는 것이 가장 안전합니다. 마지막으로 나머지 의존성을 설치하고 실행합니다.

  pip install -r requirements.txt
  python main.py

터미널에 주소가 출력되면 브라우저에서 http://127.0.0.1:8188 로 접속합니다.

■ 설치 직후 꼭 할 일: ComfyUI Manager
ComfyUI Manager는 커스텀 노드를 검색해 설치해주는 확장입니다. 이것 없이 손으로 관리하면 금방 지칩니다. custom_nodes 폴더에서 저장소를 복제한 뒤 ComfyUI를 재시작하면 화면에 Manager 버튼이 생깁니다.

  cd custom_nodes
  git clone https://github.com/ltdrdata/ComfyUI-Manager.git`
      },
      {
        heading: "모델 파일 준비하기",
        content: `ComfyUI를 설치해도 모델이 없으면 아무것도 만들 수 없습니다. 모델은 종류별로 정해진 폴더에 넣어야 인식됩니다.

• models/checkpoints — 체크포인트(본체 모델). 가장 먼저 필요한 것입니다.
• models/loras — LoRA. 특정 화풍이나 캐릭터를 덧입히는 작은 파일입니다.
• models/vae — VAE. 별도 파일이 필요한 모델에만 씁니다.
• models/controlnet — ControlNet. 포즈나 윤곽을 지정할 때 씁니다.
• models/upscale_models — 업스케일 모델.

파일을 넣은 뒤에는 ComfyUI 화면을 새로고침해야 목록에 나타납니다. 그래도 안 보이면 확장자를 확인하세요. .safetensors 또는 .ckpt여야 하며, 브라우저가 파일명 뒤에 .txt 같은 것을 붙여 저장한 경우가 종종 있습니다.

처음 받을 모델을 고를 때는 이렇게 생각하면 쉽습니다. VRAM이 8GB 미만이면 SD1.5 계열이 안전합니다. 파일이 작고 빠르며 관련 자료도 가장 많습니다. 8GB 이상이면 SDXL 계열이 기본 해상도 1024×1024로 더 좋은 결과를 냅니다. 사진처럼 사실적인 결과나 이미지 안의 글자가 중요하다면 Flux 계열이 강하지만 VRAM을 많이 요구합니다.

모델마다 권장 해상도가 다르다는 점도 중요합니다. SD1.5에 1024×1024를 요구하면 인물이 여럿 겹쳐 나오는 등 결과가 무너집니다. SD1.5는 512 근처, SDXL은 1024 근처가 기준입니다.`
      },
      {
        heading: "기본 워크플로우 이해하기",
        content: `가장 단순한 이미지 생성 워크플로우는 다섯 개의 노드로 이루어집니다. 이 다섯 개만 이해하면 나머지는 응용입니다.

1. Load Checkpoint — 모델 파일을 불러옵니다. 출력이 세 갈래(MODEL, CLIP, VAE)로 나뉘어 각각 다른 노드로 연결됩니다.
2. CLIP Text Encode — 입력한 문장을 모델이 이해하는 형태로 바꿉니다. 두 개가 필요합니다. 하나는 원하는 것(긍정), 하나는 피하고 싶은 것(부정)입니다.
3. Empty Latent Image — 결과물의 크기와 장수를 정합니다. 여기서 지정한 폭과 높이가 최종 해상도가 됩니다.
4. KSampler — 실제로 이미지를 만들어내는 핵심입니다. 아래에서 따로 설명합니다.
5. VAE Decode → Save Image — 만들어진 데이터를 눈에 보이는 이미지로 바꿔 저장합니다.

KSampler의 주요 설정값은 다음과 같습니다.
• steps(단계 수): 몇 번 다듬을지입니다. 20~30이 무난합니다. 무작정 올려도 어느 지점부터는 좋아지지 않고 시간만 늘어납니다.
• cfg: 프롬프트를 얼마나 강하게 따를지입니다. 7 안팎이 기본입니다. 너무 높이면 색이 타고 형태가 부자연스러워집니다. 참고로 Flux 계열은 구조가 달라 1.0을 씁니다.
• sampler_name: 결과의 성향을 정합니다. 무엇을 골라야 할지 모르겠다면 euler나 dpmpp_2m으로 시작하세요.
• seed: 같은 설정에 같은 시드를 주면 같은 그림이 나옵니다. 마음에 든 결과를 재현하거나, 한 부분만 바꿔 비교할 때 씁니다.
• denoise: 처음부터 만들 때는 1.0입니다. 기존 이미지를 변형할 때만 0.4~0.7 정도로 낮춥니다.

이 사이트의 생성기를 쓰면 위 구성이 이미 연결된 JSON을 바로 받을 수 있습니다.`
      },
      {
        heading: "첫 이미지 생성하기",
        content: `직접 노드를 배치하기 전에, 완성된 워크플로우를 불러와 실행해보는 편이 훨씬 빠릅니다.

1. 이 사이트의 생성기에서 만들고 싶은 유형을 고릅니다.
2. 해상도, 샘플러, 모델 등을 확인하고 필요하면 조정합니다. VRAM을 입력해두면 그에 맞게 값이 제안됩니다.
3. 생성 버튼을 누르면 워크플로우 JSON이 만들어집니다.
4. 내려받은 JSON 파일을 ComfyUI 화면에 끌어다 놓거나, 복사한 내용을 화면에서 Ctrl+V로 붙여 넣습니다.
5. Load Checkpoint 노드에서 실제 보유한 모델 파일이 선택되어 있는지 확인합니다. 파일명이 다르면 목록에서 다시 고릅니다.
6. Queue Prompt를 눌러 실행합니다.

첫 실행은 모델을 메모리에 올리느라 30초에서 1분 정도 걸립니다. 같은 모델로 이어서 만들면 이후에는 훨씬 빨라집니다.

결과가 나왔다면 다음 순서로 익히기를 권합니다. 먼저 시드를 고정한 채 프롬프트만 조금씩 바꿔봅니다. 어떤 단어가 무엇을 바꾸는지 감이 옵니다. 그다음 시드를 고정하고 steps와 cfg만 바꿔봅니다. 마지막으로 샘플러를 바꿔 성향 차이를 봅니다. 여러 값을 한꺼번에 바꾸면 무엇 때문에 달라졌는지 알 수 없습니다.`
      },
      {
        heading: "자주 만나는 오류와 해결법",
        content: `처음 며칠 동안 만나게 될 문제는 대부분 아래 몇 가지입니다.

■ CUDA out of memory
VRAM이 부족하다는 뜻입니다. 순서대로 시도하세요. 먼저 해상도를 낮춥니다. 1024×1024를 768×768로만 바꿔도 체감이 큽니다. 그다음 한 번에 만드는 장수를 1로 줄입니다. 그래도 부족하면 ComfyUI 실행 시 저사양 옵션을 붙입니다.

  python main.py --lowvram

이보다 더 부족하면 --novram 옵션이 있습니다. 느리지만 실행은 됩니다. 크롬 탭이나 게임 등 GPU를 쓰는 다른 프로그램을 닫는 것도 의외로 효과가 큽니다.

■ 노드가 빨간 테두리로 표시됨
설치되지 않은 커스텀 노드를 요구하는 워크플로우입니다. ComfyUI Manager의 누락 노드 설치 기능을 쓰면 대부분 해결됩니다. 설치 후에는 ComfyUI를 완전히 재시작해야 합니다.

■ 모델 목록이 비어 있음
파일 위치와 확장자를 확인하세요. models/checkpoints 폴더에 .safetensors 파일이 있어야 합니다. 폴더가 맞는데도 안 보이면 브라우저를 새로고침하고, 그래도 안 되면 ComfyUI를 재시작합니다.

■ 결과가 회색이나 검은색 단색으로 나옴
일부 구형 그래픽카드에서 계산 정밀도 문제로 발생합니다. 실행 시 --force-fp16 또는 --no-half-vae 옵션을 시도해보세요. 다른 VAE 파일로 바꾸면 해결되는 경우도 있습니다.

■ 인물이 여러 명 겹치거나 몸이 늘어남
모델의 권장 해상도를 벗어난 경우입니다. SD1.5 모델에 1024 이상을 요구하면 흔히 나타납니다. 기준 해상도로 만든 뒤 업스케일하는 방식으로 바꾸세요.

■ 브라우저에서 접속이 안 됨
터미널 창이 여전히 떠 있는지 확인하세요. 창을 닫으면 서버도 종료됩니다. 주소는 http://127.0.0.1:8188 이며, 8188 포트를 다른 프로그램이 쓰고 있다면 --port 8189 처럼 바꿔 실행할 수 있습니다.`
      },
      {
        heading: "다음 단계",
        content: `기본 생성이 익숙해졌다면 다음 순서로 넓혀가면 무리가 없습니다.

1. 업스케일 — 작게 만든 뒤 키우는 방식입니다. VRAM을 아끼면서 큰 이미지를 얻는 가장 현실적인 방법입니다.
2. LoRA — 원하는 화풍이나 캐릭터를 덧입힙니다. 파일이 작아 부담이 적고 효과는 확실합니다.
3. img2img와 인페인팅 — 기존 이미지를 변형하거나 일부만 고쳐 그립니다.
4. ControlNet — 포즈나 구도, 윤곽선을 지정해 결과를 통제합니다. 원하는 자세를 정확히 얻고 싶을 때 필수입니다.
5. 영상 생성 — VRAM 요구가 크게 올라가므로 마지막에 시도하세요.

각 주제는 이 사이트의 다른 가이드에서 자세히 다룹니다. 아래 관련 가이드 목록에서 이어서 읽어보세요.

마지막으로 초보자가 가장 많이 하는 실수 하나만 짚겠습니다. 남의 워크플로우를 그대로 가져다 쓰면서 자기 환경에 맞게 두 가지를 바꾸지 않는 것입니다. 하나는 Load Checkpoint의 모델 파일명이고, 다른 하나는 해상도입니다. 이 둘만 확인해도 "왜 안 되지" 하는 시간의 절반은 줄어듭니다.`
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
