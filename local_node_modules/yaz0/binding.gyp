{
    "targets": [
    {
        "include_dirs": [
            "<!(node -e \"require('nan')\")"
        ],
        "target_name": "yaz0",
        "sources": [
            "src/main.cpp",
            "src/yaz0.cpp"
        ],
        "cflags": [
          "-std=c++11",
          "-stdlib=libc++",
          '-O3'
        ]
    }
    ]
}
