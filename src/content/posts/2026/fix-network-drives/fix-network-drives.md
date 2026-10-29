---
title: "Fix Network Drives on Linux with systemd.automount"
description: "Stop slow boot times and freezing file managers on Linux by mounting your NFS and SMB network shares on demand with systemd.automount."
pubDate: 2026-10-29
category: "Linux"
image: "./thumb.jpeg"
tags: ["linux", "nfs", "smb", "nas", "homelab"]
---


## Why Standard Network Mounts Suck

If you mount your NAS or home server share in /etc/fstab with default settings, you have probably run into at least one of these problems:

- **Slow Boot Times:** Your PC waits up to 90 seconds during boot if your NAS is offline or your Wi-Fi isn't connected yet.
- **Freezing File Managers:** If the connection drops or you put your laptop to sleep, Dolphin or Nautilus completely freezes whenever you open it.
- **Slow Transfers:** Default mount settings often use tiny read/write buffers and weak recovery options.

The fix is simple: instead of forcing Linux to mount the share at boot, we let **systemd.automount** mount the drive **on demand**—the exact moment you actually open the folder—and automatically disconnect it when idle.


## Install the Required Packages

First, install the helper tools for NFS and SMB/CIFS shares and create your local mount folder:

- **Arch / CachyOS:**
  ```bash
  sudo pacman -S nfs-utils cifs-utils
  ```
- **Debian / Ubuntu:**
  ```bash
  sudo apt install nfs-common cifs-utils
  ```
- **Fedora:**
  ```bash
  sudo dnf install nfs-utils cifs-utils
  ```

Create the folder where your network drive will appear:

```bash
sudo mkdir -p /mnt/data
```


## Set Up Your Password / Access

Because automount connects silently in the background when you open the folder, it cannot ask you for a password in a terminal. How you set up access depends on whether you use **SMB** or **NFS**.

### For SMB / CIFS Shares (Username & Password)

Never put your password directly into /etc/fstab where any user on the PC can read it. Instead, create a hidden credentials file:

```bash
sudo nano /root/.smbcredentials
```

Put your NAS username and password inside:

```ini
username=your_nas_user
password=your_secret_password
```

Lock the file so only root can read it:

```bash
sudo chmod 600 /root/.smbcredentials
```

### For NFS Shares (No Password File Needed)

Standard NFS does not use a username or password on your Linux PC. Instead, you allow access directly on your NAS (TrueNAS, Synology, Unraid, etc.):
1. Allow your PC's IP address (e.g. 192.168.1.50) or home network (192.168.1.0/24) in the NFS share settings on your NAS.
2. Make sure your Linux user ID (usually 1000) has permission on the NAS, or enable **"Mapall User"** in your NAS NFS settings.


## Add the Tuned Automount to /etc/fstab

Open /etc/fstab in your text editor:

```bash
sudo nano /etc/fstab
```

Add **one** of the following lines at the bottom (replace `192.168.1.100:/data` with your NAS IP and share path):

**Option A — For NFS Shares:**
```text
192.168.1.100:/data  /mnt/data  nfs  nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=5,noatime,nofail,_netdev,x-systemd.automount,x-systemd.idle-timeout=10min,x-systemd.mount-timeout=30  0  0
```

**Option B — For SMB / CIFS Shares:**
```text
//192.168.1.100/data  /mnt/data  cifs  credentials=/root/.smbcredentials,uid=1000,gid=1000,iocharset=utf8,vers=3.1.1,noatime,nofail,_netdev,x-systemd.automount,x-systemd.idle-timeout=10min,x-systemd.mount-timeout=30  0  0
```


## What These Options Actually Do

Here is why this single line works so reliably:

- **x-systemd.automount:** Only mounts the drive when you actually open /mnt/data. Zero boot delay.
- **x-systemd.idle-timeout=10min:** Automatically unmounts the share after 10 minutes of inactivity so your file manager never hangs if you disconnect from your network.
- **x-systemd.mount-timeout=30:** Gives up after 30 seconds if the NAS is turned off instead of hanging forever.
- **nofail & _netdev:** Tells Linux that this is a network drive and not to pause or fail the boot process if the server is offline.
- **rsize=1048576,wsize=1048576 (NFS):** Increases the read/write chunk size to 1 MiB for much faster file transfers.
- **hard,timeo=600,retrans=5 (NFS):** Prevents file corruption if the network hiccups briefly during a transfer.
- **credentials=/root/.smbcredentials & uid=1000,gid=1000 (SMB):** Logs in automatically with your saved password and gives your normal Linux user full write access.


## Activate and Test

Instead of rebooting, reload systemd and activate the new automount right away:

```bash
sudo systemctl daemon-reload
sudo systemctl restart remote-fs.target
```

Now simply open `/mnt/data` in your file manager or list its contents in the terminal:

```bash
ls -la /mnt/data
```

The share will mount in a split second in the background. You now have fast transfers, zero boot hangs, and a file manager that never freezes again.


## Sources & Documentation

- Arch Wiki – NFS: [https://wiki.archlinux.org/title/NFS](https://wiki.archlinux.org/title/NFS)
- Arch Wiki – Samba / CIFS: [https://wiki.archlinux.org/title/Samba](https://wiki.archlinux.org/title/Samba)
